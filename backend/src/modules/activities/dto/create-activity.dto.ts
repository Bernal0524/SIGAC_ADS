import { IsString, IsISO8601, IsInt, Min, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ActivityStatus } from '@prisma/client';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty({ message: 'El título de la actividad es obligatorio' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'La ubicación es obligatoria para la logística' })
  location: string; 

  @IsISO8601({}, { message: 'La fecha de inicio debe tener un formato ISO válido' })
  startTime: string;

  @IsISO8601({}, { message: 'La fecha de fin debe tener un formato ISO válido' })
  endTime: string;

  @IsInt({ message: 'El máximo de participantes debe ser un número entero' })
  @Min(1, { message: 'El máximo de participantes debe ser al menos 1' })
  maxParticipants: number;

  @IsInt({ message: 'El quórum mínimo debe ser un número entero' })
  @Min(1, { message: 'El quórum debe ser al menos 1' })
  @IsNotEmpty({ message: 'Definir el quórum mínimo es parte de la Orquestación obligatoria' })
  minQuorum: number;
}

export class UpdateActivityStatusDto {
  @IsEnum(ActivityStatus, { message: 'El estado proporcionado no es válido para el flujo de SIGAC' })
  @IsNotEmpty()
  status: ActivityStatus;
}