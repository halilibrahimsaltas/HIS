import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEmail } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty({ message: 'Ad alanı zorunludur' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Soyad alanı zorunludur' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'Baba adı zorunludur' })
  fatherName: string;

  @IsDateString({}, { message: 'Geçerli bir doğum tarihi giriniz (GG.AA.YYYY)' })
  @IsNotEmpty({ message: 'Doğum tarihi zorunludur' })
  birthDate: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  identityNumber?: string;

  @IsOptional()
  @IsString()
  passportNumber?: string;
}

