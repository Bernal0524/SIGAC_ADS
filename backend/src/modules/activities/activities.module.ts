import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { PrismaService } from '../../database/prisma.service';

/**
 * Módulo de Actividades SIGAC
 * Centraliza la lógica de creación, edición y gestión de estados de la plataforma.
 */
@Module({
  controllers: [ActivitiesController],
  providers: [
    ActivitiesService, 
    PrismaService
  ],
  // Exportamos el Service para que otros módulos puedan consultar 
  // estados de actividades si es necesario.
  exports: [ActivitiesService], 
})
export class ActivitiesModule {}