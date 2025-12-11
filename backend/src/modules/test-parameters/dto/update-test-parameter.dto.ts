import { PartialType } from '@nestjs/mapped-types';
import { CreateTestParameterDto } from './create-test-parameter.dto';

export class UpdateTestParameterDto extends PartialType(CreateTestParameterDto) {}

