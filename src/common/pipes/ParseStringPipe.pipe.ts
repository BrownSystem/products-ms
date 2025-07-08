import {
  PipeTransform,
  Injectable,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ParseStringPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'El valor proporcionado no es un string válido',
      });
    }

    // Puedes agregar más validaciones si querés, por ejemplo:
    // Validar longitud mínima/máxima, patrón, etc.
    // if (!/^[a-fA-F0-9]{24}$/.test(value)) {
    //   throw new BadRequestException('El ID no es un ObjectId válido');
    // }

    return value.trim();
  }
}
