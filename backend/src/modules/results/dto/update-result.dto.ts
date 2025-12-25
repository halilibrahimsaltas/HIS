import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ResultStatus } from '@prisma/client';

export class UpdateResultDto {
  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'ENTERED', 'REJECTED'])
  status?: ResultStatus;
}

