import { IsNumber, IsArray, ArrayMinSize, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class TestSelectionDto {
  @IsNumber()
  testId: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  parameterIds?: number[];
}

export class CreateOrderDto {
  @IsNumber()
  patientId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TestSelectionDto)
  tests: TestSelectionDto[];
}

