import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { DeviceProtocol, ConnectionType } from '@prisma/client';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsEnum(DeviceProtocol)
  protocol: DeviceProtocol;

  @IsEnum(ConnectionType)
  connectionType: ConnectionType;

  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsNumber()
  port?: number;

  @IsOptional()
  @IsString()
  serialPort?: string;

  @IsOptional()
  @IsNumber()
  baudRate?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

