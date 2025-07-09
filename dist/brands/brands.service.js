"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BrandsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const microservices_1 = require("@nestjs/microservices");
let BrandsService = BrandsService_1 = class BrandsService extends client_1.PrismaClient {
    logger = new common_1.Logger(BrandsService_1.name);
    onModuleInit() {
        this.logger.log('Connecting to the database...');
        void this.$connect();
    }
    async create(createBrandDto) {
        const { name, products } = createBrandDto;
        const existingBrand = await this.findOneByName(name);
        if (existingBrand) {
            throw new microservices_1.RpcException({
                message: `Brand with name ${name} already exists`,
                status: common_1.HttpStatus.BAD_REQUEST,
            });
        }
        return this.eBrand.create({
            data: {
                name,
                products: {
                    create: products?.map((product) => ({
                        ...product,
                    })),
                },
            },
        });
    }
    async findOneByName(name) {
        return this.eBrand.findFirst({
            where: { name, available: true },
        });
    }
    async findOne(id) {
        const brand = this.eBrand.findFirst({
            where: { id, available: true },
            include: {
                products: {
                    select: {
                        id: true,
                        code: true,
                        description: true,
                    },
                    where: { available: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!brand) {
            throw new microservices_1.RpcException({
                message: `Not Found brand ${id}`,
                status: common_1.HttpStatus.BAD_REQUEST,
            });
        }
        return brand;
    }
    async update(id, updateBrandDto) {
        const isUpdateBrand = await this.findOne(id);
        if (!isUpdateBrand) {
            throw new microservices_1.RpcException({
                message: `Not Found brand ${id}`,
                status: common_1.HttpStatus.BAD_REQUEST,
            });
        }
        const { name, available } = updateBrandDto;
        return this.eBrand.update({
            where: { id },
            data: {
                name,
                available,
            },
        });
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = BrandsService_1 = __decorate([
    (0, common_1.Injectable)()
], BrandsService);
//# sourceMappingURL=brands.service.js.map