import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDeviceMappingDto {
  @IsString()
  @IsNotEmpty()
  deviceTestCode: string;

  @IsNumber()
  testParameterId: number;
}

