import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageBundleLlmModelDto } from './create-package-bundle-llm-model.dto';

export class UpdatePackageBundleLlmModelDto extends PartialType(CreatePackageBundleLlmModelDto) {}
