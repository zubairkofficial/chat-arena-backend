import { PartialType } from '@nestjs/mapped-types';
import { CreateResponseStyleDto } from './create-response-style.dto';

export class UpdateResponseStyleDto extends PartialType(
  CreateResponseStyleDto,
) {}
