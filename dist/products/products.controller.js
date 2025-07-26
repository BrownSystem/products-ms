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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("../common");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    create(createProductDto) {
        return this.productsService.create(createProductDto);
    }
    uploadWithFile(rows) {
        try {
            return this.productsService.bulkCreate(rows);
        }
        catch (error) {
            throw new microservices_1.RpcException(error);
        }
    }
    generatePdfFileWithQrs(productsWithQty) {
        return this.productsService.generateQrsPdf(productsWithQty);
    }
    search(paginationDto) {
        return this.productsService.searchProducts(paginationDto);
    }
    searchProductsWithAllBranchInventory(paginationDto) {
        return this.productsService.searchProductsWithAllBranchInventory(paginationDto);
    }
    findAll(paginationDto) {
        return this.productsService.findAll(paginationDto);
    }
    findProductForBranch(payload) {
        return this.productsService.findProductForBranch(payload);
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    update(updateProductDto) {
        return this.productsService.update(updateProductDto.id, updateProductDto);
    }
    validateProducts(ids) {
        return this.productsService.validateProducts(ids);
    }
    deleteAll() {
        return this.productsService.deleteProducts();
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create_product' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'upload_products_with_file' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "uploadWithFile", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'generate_pdf_file_with_qrs' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "generatePdfFileWithQrs", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'search_products' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.PaginationDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "search", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'search_products_with_all_branch_inventory' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.PaginationDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "searchProductsWithAllBranchInventory", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'find_all_product' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.PaginationDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'find_product_for_branch' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findProductForBranch", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'find_one_product' }),
    __param(0, (0, microservices_1.Payload)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'update_product' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'validate_products' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "validateProducts", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'delete-all-products' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "deleteAll", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map