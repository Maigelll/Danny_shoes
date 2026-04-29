import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@dannyszapatos.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Admin2024!' })
  @IsString()
  @MinLength(6, { message: 'Contraseña muy corta' })
  password: string;
}
