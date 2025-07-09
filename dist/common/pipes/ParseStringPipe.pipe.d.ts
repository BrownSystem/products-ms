import { PipeTransform } from '@nestjs/common';
export declare class ParseStringPipe implements PipeTransform {
    transform(value: any): string;
}
