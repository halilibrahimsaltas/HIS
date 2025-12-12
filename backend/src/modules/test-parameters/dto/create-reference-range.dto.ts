import { IsEnum, IsString, IsOptional, IsNumber } from 'class-validator';
import { AgeGroup, Gender } from '@prisma/client';

export class CreateReferenceRangeDto {
  @IsEnum(AgeGroup)
  ageGroup: AgeGroup;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  rangeText?: string;

  @IsOptional()
  @IsNumber()
  minValue?: number;

  @IsOptional()
  @IsNumber()
  maxValue?: number;
}

