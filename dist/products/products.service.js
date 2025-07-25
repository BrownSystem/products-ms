"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const microservices_1 = require("@nestjs/microservices");
const brands_service_1 = require("../brands/brands.service");
const config_1 = require("../config");
const rxjs_1 = require("rxjs");
const common_2 = require("../common");
const QRcode = require("qrcode");
const PDFDocument = require("pdfkit");
const p_limit_1 = require("p-limit");
let ProductsService = ProductsService_1 = class ProductsService extends client_1.PrismaClient {
    client;
    brandService;
    logger = new common_1.Logger(ProductsService_1.name);
    _buildSearchQuery(search) {
        const where = { available: true };
        if (search?.trim()) {
            const words = search.trim().split(/\s+/);
            where.AND = words.map((word) => ({
                OR: [
                    { code: { contains: word, mode: 'insensitive' } },
                    { description: { contains: word, mode: 'insensitive' } },
                ],
            }));
        }
        return where;
    }
    async _filterProductsByBranch(products, branchId) {
        const results = await Promise.all(products.map(async (item) => {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: 'find_one_product_branch_id' }, { productId: item.id, branchId }));
                const { stock, id } = response;
                const { qrCode, ...product } = item;
                return response ? { product, inventory: { id, stock } } : null;
            }
            catch (err) {
                return {
                    message: `[FIND_ONE_BRANCH_PRODUCT] Error en la peticion`,
                };
            }
        }));
        return results.filter((item) => item !== null);
    }
    constructor(client, brandService) {
        super();
        this.client = client;
        this.brandService = brandService;
    }
    onModuleInit() {
        void this.$connect();
        this.logger.log('Database connected');
    }
    async bulkCreate(createProductDtos) {
        const limit = (0, p_limit_1.default)(20);
        const results = await Promise.all(createProductDtos.map((product) => limit(async () => {
            try {
                await this.create(product);
                return {
                    message: '[BULK_CREATE] Product created successfully',
                    status: common_1.HttpStatus.CREATED,
                };
            }
            catch (error) {
                return {
                    message: '[BULK_CREATE] Error creating product',
                    error,
                    status: common_1.HttpStatus.BAD_REQUEST,
                };
            }
        })));
        return results;
    }
    async generateNextProductCode() {
        const lastProduct = await this.eProduct.findFirst({
            orderBy: { code: 'desc' },
            select: { code: true },
        });
        const lastCode = lastProduct?.code || '1000';
        const nextCode = (parseInt(lastCode) + 1).toString();
        return nextCode;
    }
    async create(createProductDto) {
        try {
            const { brandId, description, available } = createProductDto;
            if (brandId) {
                const isBrand = await this.brandService.findOne(brandId);
                if (!isBrand) {
                    throw new microservices_1.RpcException({
                        message: `[CREATE] Brand with id ${brandId} not found`,
                        status: common_1.HttpStatus.BAD_REQUEST,
                    });
                }
            }
            const code = await this.generateNextProductCode();
            const qrBase64 = await QRcode.toDataURL(code);
            const newProduct = await this.eProduct.create({
                data: {
                    code,
                    description: description,
                    available: available,
                    qrCode: qrBase64,
                    brandId: brandId,
                },
            });
            const emitBranchMS = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: 'emit_create_branch_product' }, {
                productId: newProduct.id,
                stock: 0,
            }));
            return newProduct;
        }
        catch (error) {
            return error;
        }
    }
    async generateQrsPdf(productsWithQty) {
        const codes = productsWithQty.map((p) => p.code);
        const products = await this.eProduct.findMany({
            where: { code: { in: codes } },
            select: { code: true, description: true, qrCode: true },
        });
        const expandedProducts = productsWithQty.flatMap(({ code, quantity }) => {
            const product = products.find((p) => p.code === code);
            if (!product)
                return [];
            return Array(quantity).fill(product);
        });
        const doc = new PDFDocument({
            size: [288, 144],
            margin: 10,
        });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        expandedProducts.forEach((product, index) => {
            if (index !== 0)
                doc.addPage();
            const qrImage = product.qrCode?.replace(/^data:image\/png;base64,/, '');
            const pageWidth = 288;
            const pageHeight = 144;
            const padding = 30;
            const qrSize = 80;
            const gap = 20;
            const textWidth = pageWidth - qrSize - 3 * padding;
            const textX = padding;
            const textY = padding;
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
        return await new Promise((resolve, reject) => {
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer.toString('base64'));
            });
            doc.on('error', (err) => reject(err));
        });
    }
    async findAll(paginationDto) {
        const { offset, limit } = paginationDto;
        const totalProducts = await this.eProduct.count({
            where: { available: true },
        });
        const totalPages = Math.ceil(totalProducts / limit);
        let branchStock = [];
        try {
            branchStock = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: 'find_all_stock_branch' }, {}));
        }
        catch (error) {
            this.logger.error('[FIND_ALL] Failed to fetch branch stock', error);
        }
        const stockMap = new Map(branchStock.map((stock) => [stock.productId, stock.stock]));
        const products = await this.eProduct.findMany({
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
    async findProductForBranch(data) {
        const { page = 1, pageSize = 100 } = data || {};
        const products = await this.eProduct.findMany({
            where: { available: true },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: { id: true },
        });
        return { data: products, page, pageSize };
    }
    async findOne(id) {
        try {
            const product = await this.eProduct.findFirst({
                where: { id, available: true },
            });
            if (!product) {
                return {
                    message: `[FIND_ONE] El producto no existe o se dio de baja ${id}`,
                    status: common_1.HttpStatus.BAD_REQUEST,
                };
            }
            return product;
        }
        catch (error) {
            return {
                message: `[FIND_ONE] Error al buscar el producto ${id}`,
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
    async findByCode(code, throwIfNotFound = false) {
        const product = await this.eProduct.findFirst({ where: { code } });
        if (!product && throwIfNotFound) {
            throw new microservices_1.RpcException({
                message: `[FIND_BY_CODE] Product with code ${code} not found`,
                status: common_1.HttpStatus.NOT_FOUND,
            });
        }
        return product;
    }
    async update(id, updateProductDto) {
        await this.findOne(id);
        const branches = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: 'find_all_branches' }, {}));
        const stocks = await Promise.all(branches.map(async (branch) => {
            const existingStock = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: 'find_one_product_branch_id' }, { productId: id, branchId: branch.id }));
            return existingStock.stock;
        }));
        const allZeroStock = stocks.every((stock) => stock === 0);
        if (updateProductDto.available === false && !allZeroStock) {
            throw new microservices_1.RpcException({
                message: 'No se puede deshabilitar el producto porque hay stock disponible en alguna sucursal.',
                status: common_1.HttpStatus.BAD_REQUEST,
            });
        }
        const { ...data } = updateProductDto;
        return this.eProduct.update({
            where: { id },
            data,
        });
    }
    async searchProducts(paginationDto) {
        const { search, branchId } = paginationDto;
        const where = this._buildSearchQuery(search);
        const paginatedProducts = await (0, common_2.PaginateWithMeta)({
            model: this.eProduct,
            where,
            pagination: paginationDto,
        });
        if (paginatedProducts.data.length === 0) {
            throw new microservices_1.RpcException({
                status: common_1.HttpStatus.NOT_FOUND,
                message: '[SEARCH_PRODUCTS] No products found',
            });
        }
        if (!branchId)
            return paginatedProducts;
        const filteredProducts = await this._filterProductsByBranch(paginatedProducts.data, branchId);
        if (filteredProducts.length === 0) {
            throw new microservices_1.RpcException({
                status: common_1.HttpStatus.NOT_FOUND,
                message: `[SEARCH_PRODUCTS] No products found in branch ${branchId}`,
            });
        }
        const productosOrdenados = filteredProducts.sort((a, b) => a.inventory.stock - b.inventory.stock);
        return {
            data: productosOrdenados,
            meta: paginatedProducts.meta,
        };
    }
    async searchProductsWithAllBranchInventory(paginationDto) {
        const { search } = paginationDto;
        const where = this._buildSearchQuery(search);
        const paginatedProducts = await (0, common_2.PaginateWithMeta)({
            model: this.eProduct,
            where,
            pagination: paginationDto,
        });
        if (paginatedProducts.data.length === 0) {
            throw new microservices_1.RpcException({
                status: common_1.HttpStatus.NOT_FOUND,
                message: '[SEARCH_PRODUCTS_ALL_BRANCHES] No products found',
            });
        }
        const branches = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: 'find_all_branches' }, {}));
        const enrichedProducts = await Promise.all(paginatedProducts.data.map(async (product) => {
            const branchInventories = await Promise.all(branches.map(async (branch) => {
                try {
                    const response = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: 'find_one_product_branch_id' }, { productId: product.id, branchId: branch.id }));
                    return {
                        branchId: branch.id,
                        branchName: branch.name,
                        stock: response?.stock ?? 0,
                    };
                }
                catch {
                    return {
                        branchId: branch.id,
                        branchName: branch.name,
                        stock: null,
                        error: 'Error al obtener stock',
                    };
                }
            }));
            const { qrCode, ...cleanProduct } = product;
            return {
                product: cleanProduct,
                inventoryByBranch: branchInventories,
            };
        }));
        return {
            data: enrichedProducts,
            meta: paginatedProducts.meta,
        };
    }
    async validateProducts(ids) {
        ids = Array.from(new Set(ids));
        const product = await this.eProduct.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
        if (product.length !== ids.length) {
            throw new microservices_1.RpcException({
                status: common_1.HttpStatus.NOT_FOUND,
                message: '[VALIDATE_PRODUCTS] Some products were not found',
            });
        }
        return product;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.NATS_SERVICE)),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        brands_service_1.BrandsService])
], ProductsService);
//# sourceMappingURL=products.service.js.map