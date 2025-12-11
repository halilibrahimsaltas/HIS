import { IsString, IsNumber, IsNotEmpty, IsEnum, IsArray, IsOptional } from 'class-validator';
import { TestCategory } from '@prisma/client';

export class CreateTestDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TestCategory)
  @IsNotEmpty()
  category: TestCategory;

  @IsNumber()
  price: number;

  @IsString()
  @IsNotEmpty()
  sampleType: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  parameterIds?: number[];
}

