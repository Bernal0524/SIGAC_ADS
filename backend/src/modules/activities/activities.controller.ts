import { 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Delete,
  Body, 
  Param, 
  Query,
  UseGuards
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityStatusDto } from './dto/create-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * SIGAC - CONTROLADOR DE ORQUESTACIÓN
 * Este controlador maneja la lógica de negocio para la gestión de actividades.
 */
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // --- 1. RUTAS ESTÁTICAS (Deben ir primero) ---

  @Get()
  findAll(
    @GetUser('id') userId: string,
    @GetUser('role') role: Role
  ) {
    return this.activitiesService.findAll(userId, role);
  }

  /**
   * Endpoint de Disponibilidad: Retorna colaboradores libres.
   * Se coloca antes de :id para evitar que NestJS lo confunda con un parámetro.
   */
  @Get('available-participants')
  @Roles(Role.COORDINADOR)
  getAvailable(
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    return this.activitiesService.getAvailableParticipants(start, end);
  }

  // --- 2. RUTAS DE CREACIÓN ---

  @Post('create')
  @Roles(Role.COORDINADOR)
  create(
    @GetUser('id') userId: string, 
    @Body() dto: CreateActivityDto & { participantIds?: string[] }
  ) {
    return this.activitiesService.create(userId, dto);
  }

  // --- 3. RUTAS DINÁMICAS (Con :id) ---

  /**
   * CONSULTA DE DETALLE: Crucial para EDITAR.
   * Si este endpoint falla, el formulario de edición aparecerá vacío.
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: Role
  ) {
    return this.activitiesService.findOne(id, userId, role);
  }

  @Post(':id/join')
  join(
    @GetUser('id') userId: string, 
    @Param('id') activityId: string
  ) {
    return this.activitiesService.joinActivity(userId, activityId);
  }

  @Patch(':id/status')
  @Roles(Role.COORDINADOR)
  updateStatus(
    @Param('id') activityId: string,
    @GetUser('id') adminId: string,
    @Body() dto: UpdateActivityStatusDto
  ) {
    return this.activitiesService.updateStatus(activityId, adminId, dto.status);
  }

  /**
   * ACTUALIZACIÓN TÉCNICA
   * Sincronizado con la validación de estado PROPUESTA del Service.
   */
  @Patch(':id')
  @Roles(Role.COORDINADOR)
  updateActivity(
    @Param('id') activityId: string,
    @GetUser('id') adminId: string,
    @Body() dto: Partial<CreateActivityDto> & { participantIds?: string[] }
  ) {
    return this.activitiesService.updateActivity(activityId, adminId, dto);
  }

  @Delete(':id')
  @Roles(Role.COORDINADOR)
  remove(
    @Param('id') activityId: string,
    @GetUser('id') adminId: string
  ) {
    return this.activitiesService.deleteActivity(activityId, adminId);
  }
}