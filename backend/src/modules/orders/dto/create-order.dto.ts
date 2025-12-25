import { IsNumber, IsArray, ArrayMinSize, ValidateNested, IsOptional, IsString, Min, Max, ValidateIf } from 'class-validator';
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

  @IsOptional()
  @ValidateIf((o) => o.discountPercentage !== null && o.discountPercentage !== undefined)
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number | null;

  @IsOptional()
  @ValidateIf((o) => o.discountExplanation !== null && o.discountExplanation !== undefined)
  @IsString()
  discountExplanation?: string | null;

  @IsOptional()
  @IsNumber()
  branchId?: number;
}

