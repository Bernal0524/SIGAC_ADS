import { IsISO8601, IsInt, Min, Max, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvailabilityDto {
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria para la orquestación' })
  @IsString({ message: 'startTime debe ser una cadena de texto en formato ISO' })
  @IsISO8601({}, { message: 'startTime debe ser una fecha válida (Ej: 2026-03-10T08:00:00Z)' })
  startTime: string;

  @IsNotEmpty({ message: 'La hora de fin es obligatoria para la orquestación' })
  @IsString({ message: 'endTime debe ser una cadena de texto en formato ISO' })
  @IsISO8601({}, { message: 'endTime debe ser una fecha válida (Ej: 2026-03-10T12:00:00Z)' })
  endTime: string;

  @IsNotEmpty({ message: 'El día de la semana es obligatorio' })
  @IsInt({ message: 'El día de la semana debe ser un número entero' })
  @Min(0, { message: 'El día mínimo es 0 (Domingo)' })
  @Max(6, { message: 'El día máximo es 6 (Sábado)' })
  @Type(() => Number) 
  dayOfWeek: number;
}