import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  MaxLength 
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio para el perfil' })
  @MaxLength(50, { message: 'El nombre es demasiado largo (máximo 50 caracteres)' })
  name: string;

  @IsEmail({}, { message: 'El formato de correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido para el acceso' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La seguridad requiere una contraseña de al menos 6 caracteres' })
  password: string;

  @IsString({ message: 'El código de conexión debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código de invitación es obligatorio para vincularte a un sector' })
  inviteCode: string; 
}