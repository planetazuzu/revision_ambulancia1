import { PartialType } from '@nestjs/mapped-types';
import { CreateUSVBKitDto } from './create-usvb-kit.dto';

export class UpdateUSVBKitDto extends PartialType(CreateUSVBKitDto) {}
