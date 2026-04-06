import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  /**
   * Sincronización masiva (Usado por el botón "Guardar Cambios")
   */
  @Post('sync')
  sync(
    @GetUser('id') userId: string,
    @Body() dto: { availabilities: CreateAvailabilityDto[] }
  ) {
    return this.availabilityService.sync(userId, dto.availabilities);
  }

  /**
   * Registro individual de franja
   */
  @Post()
  create(
    @GetUser('id') userId: string, 
    @Body() dto: CreateAvailabilityDto
  ) {
    return this.availabilityService.create(userId, dto);
  }

  /**
   * Consulta de disponibilidad según rol (Personal o Supervisión)
   */
  @Get()
  findAll(
    @GetUser('id') userId: string,
    @GetUser('role') role: Role
  ) {
    return this.availabilityService.findAll(userId, role);
  }

  /**
   * Eliminar franja específica
   */
  @Delete(':id')
  remove(
    @GetUser('id') userId: string, 
    @Param('id') id: string
  ) {
    return this.availabilityService.remove(id, userId);
  }
}