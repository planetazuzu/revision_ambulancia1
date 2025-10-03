import { PartialType } from '@nestjs/mapped-types';
import { CreateUSVBKitMaterialDto } from './create-usvb-kit-material.dto';

export class UpdateUSVBKitMaterialDto extends PartialType(CreateUSVBKitMaterialDto) {}
