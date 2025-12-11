import { IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateResultDto } from './update-result.dto';

export class ResultItemDto extends UpdateResultDto {
  @IsNumber()
  orderTestParameterId: number;
}

export class UpdateMultipleResultsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultItemDto)
  results: ResultItemDto[];
}

