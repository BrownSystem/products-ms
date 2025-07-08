import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller()
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @MessagePattern({ cmd: 'create_brand' })
  create(@Payload() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @MessagePattern({ cmd: 'find_one_brand' })
  findOne(@Payload() id: string) {
    return this.brandsService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_brand' })
  update(@Payload() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(updateBrandDto.id, updateBrandDto);
  }
}
