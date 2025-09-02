import { PartialType } from '@nestjs/mapped-types';
import { CreateAmpularioMaterialDto } from './create-ampulario-material.dto';

export class UpdateAmpularioMaterialDto extends PartialType(CreateAmpularioMaterialDto) {}
