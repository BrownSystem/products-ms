import {
  Injectable,
  OnModuleInit,
  Logger,
  HttpStatus,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { BrandsService } from 'src/brands/brands.service';
import { NATS_SERVICE } from 'src/config';
import { first, firstValueFrom } from 'rxjs';
import { PaginateWithMeta, PaginationDto } from 'src/common';
import * as QRcode from 'qrcode';
import * as PDFDocument from 'pdfkit';
import pLimit from 'p-limit';
@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  // 👉 Método privado para construir el filtro de búsqueda más flexible
  private _buildSearchQuery(search?: string) {
    const where: any = { available: true };

    if (search?.trim()) {
      const words = search.trim().split(/\s+/);

      where.AND = words.map((word) => {
        const filters: any[] = [
          { description: { contains: word, mode: 'insensitive' } },
        ];

        if (!isNaN(Number(word))) {
          filters.push({ code: { equals: Number(word) } });
        }

        return { OR: filters };
      });
    }

    return where;
  }

  // 👉 Método privado para filtrar productos por branchId
  private async _filterProductsByBranch(
    products: any[],
    branchId: string,
  ): Promise<any[]> {
    const results = await Promise.all(
      products.map(async (item) => {
        try {
          const response = await firstValueFrom(
            this.client.send(
              { cmd: 'find_one_product_branch_id' },
              { productId: item.id, branchId },
            ),
          );

          const { stock, id } = response;

          const { qrCode, ...product } = item;

          return response ? { product, inventory: { id, stock } } : null;
        } catch (err) {
          return {
            message: `[FIND_ONE_BRANCH_PRODUCT] Error en la peticion`,
          };
        }
      }),
    );

    return results.filter((item) => item !== null);
  }

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly brandService: BrandsService,
  ) {
    super();
  }

  onModuleInit() {
    void this.$connect();
    this.logger.log('Database connected');
  }

  async bulkCreate(createProductDtos: CreateProductDto[]) {
    const limit = pLimit(20); // limitar a 20 promesas simultáneas

    const results = await Promise.all(
      createProductDtos.map((product) =>
        limit(async () => {
          try {
            await this.create(product);
            return {
              message: '[BULK_CREATE] Product created successfully',
              status: HttpStatus.CREATED,
            };
          } catch (error) {
            return {
              message: '[BULK_CREATE] Error creating product',
              error,
              status: HttpStatus.BAD_REQUEST,
            };
          }
        }),
      ),
    );

    return results;
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const { brandId, description, available } = createProductDto;

      if (brandId) {
        const isBrand = await this.brandService.findOne(brandId);
        if (!isBrand) {
          throw new RpcException({
            message: `[CREATE] Brand with id ${brandId} not found`,
            status: HttpStatus.BAD_REQUEST,
          });
        }
      }

      const newProduct = await this.eProduct.create({
        data: {
          description,
          available,
          brandId,
        },
      });

      await firstValueFrom(
        this.client.send(
          { cmd: 'emit_create_branch_product' },
          {
            productId: newProduct.id,
            stock: 0,
          },
        ),
      );

      const code = `${newProduct.code} - ${newProduct.description}`;

      const qrCodeDataUrl = await QRcode.toDataURL(code);

      const updatedProduct = await this.eProduct.update({
        where: { id: newProduct.id },
        data: { qrCode: qrCodeDataUrl },
      });

      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }

  async generateQrsPdf(
    productsWithQty: { code: number; quantity: number }[],
  ): Promise<string> {
    const codes = productsWithQty.map((p) => p.code);

    const products = await this.eProduct.findMany({
      where: { code: { in: codes } },
      select: { code: true, description: true, qrCode: true },
    });

    // Crear una lista con repeticiones según la cantidad
    const expandedProducts = productsWithQty.flatMap(({ code, quantity }) => {
      const product = products.find((p) => p.code === code);
      if (!product) return [];

      return Array(quantity).fill(product);
    });

    const doc = new PDFDocument({
      size: [288, 144], // 4x2 pulgadas en puntos (72dpi * 4in, 2in)
      margin: 10,
    });
    const buffers: Uint8Array[] = [];

    doc.on('data', buffers.push.bind(buffers));

    expandedProducts.forEach((product, index) => {
      if (index !== 0) doc.addPage();

      const qrImage = (product.qrCode as string)?.replace(
        /^data:image\/png;base64,/,
        '',
      );

      const pageWidth = 288;
      const pageHeight = 144;

      const padding = 30;
      const qrSize = 80;
      const gap = 20; // Espacio reducido entre texto y QR

      const textWidth = pageWidth - qrSize - 3 * padding;
      const textX = padding;
      const textY = padding;

      // Dibujo del texto (más cerca del QR)
      let currentY = textY;

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Producto:', textX, currentY, { width: textWidth });

      currentY += 18;
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(product.code, textX, currentY, { width: textWidth });

      currentY += 16;
      doc
        .fontSize(10)
        .text(product.description ?? '', textX, currentY, { width: textWidth });

      // Dibujo del QR (alineado arriba a la derecha, cerca del texto)
      if (qrImage) {
        const imgBuffer = Buffer.from(qrImage, 'base64');
        const qrX = textX + textWidth + gap;
        const qrY = textY;

        doc.image(imgBuffer, qrX, qrY, {
          width: qrSize,
          height: qrSize,
        });
      }
    });

    doc.end();

    return await new Promise<string>((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer.toString('base64'));
      });
      doc.on('error', (err) => reject(err));
    });
  }

  async generatePdfWithProductsTable(
    productsWithQty: { code: number; quantity: number }[],
  ): Promise<string> {
    const codes = productsWithQty.map((p) => p.code);

    const products = await this.eProduct.findMany({
      where: { code: { in: codes } },
      select: { code: true, description: true },
    });

    // Expandir según cantidad
    const expandedProducts = productsWithQty.flatMap(({ code, quantity }) => {
      const product = products.find((p) => p.code === code);
      if (!product) return [];
      return Array(quantity).fill(product);
    });

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const buffers: Uint8Array[] = [];
    doc.on('data', buffers.push.bind(buffers));

    // Título
    doc.fontSize(20).text('Listado de Productos', {
      align: 'center',
    });
    doc.moveDown(1.5);

    // Encabezado de tabla
    const tableTop = doc.y;
    const column1X = 50;
    const column2X = 200;
    const rowHeight = 25;

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Código', column1X, tableTop)
      .text('Descripción', column2X, tableTop);

    doc
      .moveTo(column1X, tableTop + 18)
      .lineTo(550, tableTop + 18)
      .stroke();

    let currentY = tableTop + rowHeight;

    doc.font('Helvetica').fontSize(11);

    for (const product of expandedProducts) {
      if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        currentY = 50;

        // Redibujar encabezado en nueva página
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Código', column1X, currentY)
          .text('Descripción', column2X, currentY);

        doc
          .moveTo(column1X, currentY + 18)
          .lineTo(550, currentY + 18)
          .stroke();

        currentY += rowHeight;
        doc.font('Helvetica').fontSize(11);
      }

      doc.text(product.code.toString(), column1X, currentY, {
        width: 100,
        ellipsis: true,
      });
      doc.text(product.description || '', column2X, currentY, {
        width: 350,
        ellipsis: true,
      });

      currentY += rowHeight;
    }

    doc.end();

    return await new Promise<string>((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer.toString('base64'));
      });
      doc.on('error', (err) => reject(err));
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { offset, limit } = paginationDto;

    const totalProducts = await this.eProduct.count({
      where: { available: true },
    });

    const totalPages = Math.ceil(totalProducts / limit);

    let branchStock: { productId: string; stock: number }[] = [];
    try {
      branchStock = await firstValueFrom(
        this.client.send({ cmd: 'find_all_stock_branch' }, {}),
      );
    } catch (error) {
      this.logger.error('[FIND_ALL] Failed to fetch branch stock', error);
    }

    const stockMap = new Map(
      branchStock.map((stock) => [stock.productId, stock.stock]),
    );

    const products = await this.eProduct.findMany({
      orderBy: {
        description: 'asc',
      },
      skip: (offset - 1) * limit,
      take: limit,
      where: { available: true },
      select: {
        id: true,
        code: true,
        description: true,
        available: true,
        createdAt: true,
        qrCode: true,
        updatedAt: true,
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

    const productsWithStock = products.map((product) => ({
      ...product,
      stock: stockMap.get(product.id) || 0,
    }));

    return {
      data: productsWithStock,
      meta: {
        total: totalProducts,
        page: offset,
        lastPage: totalPages,
      },
    };
  }

  async findProductForBranch(data: { page: number; pageSize: number }) {
    const { page = 1, pageSize = 100 } = data || {};
    const products = await this.eProduct.findMany({
      where: { available: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true },
    });

    return { data: products, page, pageSize };
  }

  async findOne(id: string) {
    try {
      const product = await this.eProduct.findFirst({
        where: { id, available: true },
      });
      if (!product) {
        return {
          message: `[FIND_ONE] El producto no existe o se dio de baja ${id}`,
          status: HttpStatus.BAD_REQUEST,
        };
      }

      return product;
    } catch (error) {
      return {
        message: `[FIND_ONE] Error al buscar el producto ${id}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async findByCode(code: number, throwIfNotFound = false) {
    const product = await this.eProduct.findFirst({ where: { code } });
    if (!product && throwIfNotFound) {
      throw new RpcException({
        message: `[FIND_BY_CODE] Product with code ${code} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const branches = await firstValueFrom(
      this.client.send({ cmd: 'find_all_branches' }, {}),
    );

    // 🔁 Obtener los stocks de todas las sucursales
    const stocks = await Promise.all(
      branches.map(async (branch: any) => {
        const existingStock = await firstValueFrom(
          this.client.send(
            { cmd: 'find_one_product_branch_id' },
            { productId: id, branchId: branch.id },
          ),
        );
        return existingStock.stock;
      }),
    );

    const allZeroStock = stocks.every((stock) => stock === 0);

    // 💡 Si quiere deshabilitarlo (available = false), y hay stock > 0, lanzar error
    if (updateProductDto.available === false && !allZeroStock) {
      throw new RpcException({
        message:
          'No se puede deshabilitar el producto porque hay stock disponible en alguna sucursal.',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // 📦 Actualizar normalmente
    const { ...data } = updateProductDto;

    return this.eProduct.update({
      where: { id },
      data,
    });
  }

  async searchProducts(paginationDto: PaginationDto) {
    const { search, branchId } = paginationDto;

    // 1. Construimos condiciones de búsqueda base
    const where = this._buildSearchQuery(search);

    // 2. Obtenemos productos paginados por texto y disponibilidad
    const paginatedProducts = await PaginateWithMeta({
      model: this.eProduct,
      where,
      pagination: paginationDto,
    });

    if (paginatedProducts.data.length === 0) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: '[SEARCH_PRODUCTS] No products found',
      });
    }

    // 3. Si no hay branchId, devolvemos el resultado directamente
    if (!branchId) return paginatedProducts;

    // 4. Si hay branchId, filtramos productos válidos para esa sucursal
    const filteredProducts = await this._filterProductsByBranch(
      paginatedProducts.data,
      branchId,
    );

    if (filteredProducts.length === 0) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `[SEARCH_PRODUCTS] No products found in branch ${branchId}`,
      });
    }

    // 5. Retornamos productos filtrados, reutilizando paginación original
    const productosOrdenados = filteredProducts.sort(
      (a, b) => a.inventory.stock - b.inventory.stock,
    );

    return {
      data: productosOrdenados,
      meta: paginatedProducts.meta,
    };
  }

  async searchProductsWithAllBranchInventory(paginationDto: PaginationDto) {
    const { search } = paginationDto;
    // 1. Filtro base
    const where = this._buildSearchQuery(search);

    // 2. Paginación de productos
    const paginatedProducts = await PaginateWithMeta({
      model: this.eProduct,
      where,
      pagination: paginationDto,
    });

    if (paginatedProducts.data.length === 0) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: '[SEARCH_PRODUCTS_ALL_BRANCHES] No products found',
      });
    }

    // 3. Obtener todas las sucursales disponibles
    const branches = await firstValueFrom(
      this.client.send({ cmd: 'find_all_branches' }, {}),
    );

    // 4. Para cada producto, obtener inventario por sucursal
    const enrichedProducts = await Promise.all(
      paginatedProducts.data.map(async (product) => {
        const branchInventories = await Promise.all(
          branches.map(async (branch) => {
            try {
              const response = await firstValueFrom(
                this.client.send(
                  { cmd: 'find_one_product_branch_id' },
                  { productId: product.id, branchId: branch.id },
                ),
              );

              return {
                branchId: branch.id,
                branchName: branch.name,
                stock: response?.stock ?? 0,
              };
            } catch {
              return {
                branchId: branch.id,
                branchName: branch.name,
                stock: null,
                error: 'Error al obtener stock',
              };
            }
          }),
        );

        const { qrCode, ...cleanProduct } = product;
        return {
          product: cleanProduct,
          inventoryByBranch: branchInventories,
        };
      }),
    );

    // 5. Retorno estructurado con meta
    return {
      data: enrichedProducts,
      meta: paginatedProducts.meta,
    };
  }

  async validateProducts(ids: string[]) {
    // TODO:El set permite que los Ids no esten duplicados, crea una nueva lista.
    ids = Array.from(new Set(ids));

    // TODO: Esta estructura de where permite encontrar todos los ids en la BD, por lo que si uno de ellos no se encuentra no lo devuelve.
    const product = await this.eProduct.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (product.length !== ids.length) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: '[VALIDATE_PRODUCTS] Some products were not found',
      });
    }

    return product;
  }

  async deleteProducts() {
    const products = await this.eProduct.deleteMany();
    return products;
  }
}
