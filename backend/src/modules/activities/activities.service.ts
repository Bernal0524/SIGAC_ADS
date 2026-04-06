import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityStatus, Role } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una nueva orquestación.
   */
  async create(adminId: string, dto: CreateActivityDto & { participantIds?: string[] }) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start < new Date()) throw new BadRequestException('La fecha no puede ser en el pasado');
    if (start >= end) throw new BadRequestException('La hora de inicio debe ser menor a la de fin');

    const participantsData = dto.participantIds?.map(userId => ({
      userId: userId
    })) || [];

    return this.prisma.activity.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        maxParticipants: Number(dto.maxParticipants),
        minQuorum: Number(dto.minQuorum),
        startTime: start,
        endTime: end,
        adminId,
        status: ActivityStatus.PROPUESTA,
        participants: {
          create: participantsData
        }
      },
      include: { 
        participants: { 
          include: { 
            user: { select: { id: true, name: true, email: true, sector: true } } 
          } 
        },
        _count: { select: { participants: true } }
      }
    });
  }

  /**
   * Obtiene una actividad específica (Resuelve la carga de info al editar).
   */
  async findOne(id: string, userId: string, role: Role) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        admin: { select: { id: true, name: true, sector: true } },
        participants: { 
          include: { 
            user: { select: { id: true, name: true, email: true, sector: true } } 
          } 
        },
        _count: { select: { participants: true } }
      }
    });

    if (!activity) throw new NotFoundException('Orquestación no encontrada');
    
    if (role === Role.COORDINADOR && activity.adminId !== userId) {
        throw new ForbiddenException('No tienes acceso a esta actividad');
    }

    return activity;
  }

  /**
   * Actualiza los datos de la actividad.
   */
  async updateActivity(activityId: string, adminId: string, dto: any) {
    const activity = await this.prisma.activity.findUnique({ 
      where: { id: activityId },
      include: { participants: true } 
    });

    if (!activity) throw new NotFoundException('Actividad no encontrada');
    if (activity.adminId !== adminId) throw new ForbiddenException('No autorizado');

    if (activity.status !== ActivityStatus.PROPUESTA) {
      throw new BadRequestException(`No se permite editar: La actividad está en ${activity.status}`);
    }

    const { participantIds, ...data } = dto;

    const updateData: any = {
      ...data,
      maxParticipants: data.maxParticipants !== undefined ? Number(data.maxParticipants) : undefined,
      minQuorum: data.minQuorum !== undefined ? Number(data.minQuorum) : undefined,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
    };

    if (participantIds) {
      updateData.participants = {
        deleteMany: {},
        create: participantIds.map((id: string) => ({ userId: id }))
      };
    }

    return this.prisma.activity.update({
      where: { id: activityId },
      data: updateData,
      include: { 
        participants: { include: { user: { select: { name: true, sector: true } } } },
        _count: { select: { participants: true } }
      }
    });
  }

  /**
   * Cambia el estado de la actividad.
   */
  async updateStatus(activityId: string, adminId: string, status: ActivityStatus) {
    const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity || activity.adminId !== adminId) throw new ForbiddenException('No autorizado');

    if (activity.status === ActivityStatus.CANCELADA || activity.status === ActivityStatus.FINALIZADA) {
      throw new BadRequestException('La actividad ya está cerrada');
    }

    return this.prisma.activity.update({
      where: { id: activityId },
      data: { status }
    });
  }

  /**
   * Lista todas las actividades.
   */
  async findAll(userId: string, role: Role) {
    return this.prisma.activity.findMany({
      where: role === Role.COORDINADOR ? { adminId: userId } : {},
      include: {
        admin: { select: { name: true, sector: true } },
        _count: { select: { participants: true } }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  /**
   * Elimina la orquestación.
   */
  async deleteActivity(activityId: string, adminId: string) {
    const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) throw new NotFoundException('Actividad no encontrada');
    if (activity.adminId !== adminId) throw new ForbiddenException('No autorizado');

    return this.prisma.activity.delete({ where: { id: activityId } });
  }

  /**
   * Filtro de disponibilidad (CORREGIDO PARA TU SCHEMA).
   * Se usa 'registrations' en lugar de 'participants'.
   */
  async getAvailableParticipants(startStr: string, endStr: string) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new BadRequestException('Fechas inválidas');

    return this.prisma.user.findMany({
      where: {
        role: Role.COLABORADOR,
        // Disponibilidad del usuario
        availabilities: { 
          some: { startTime: { lte: start }, endTime: { gte: end } } 
        },
        // FILTRO DE TRASLAPES: Usamos 'registrations' que es el nombre en tu model User
        registrations: {
          none: {
            activity: {
              status: { in: [ActivityStatus.PROPUESTA, ActivityStatus.CONFIRMADA] },
              AND: [
                { startTime: { lt: end } }, 
                { endTime: { gt: start } }
              ]
            }
          }
        }
      },
      select: { id: true, name: true, email: true, sector: true }
    });
  }

  /**
   * Inscripción manual de colaboradores.
   */
  async joinActivity(userId: string, activityId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: { _count: { select: { participants: true } } },
    });

    if (!activity) throw new NotFoundException('Actividad no encontrada');
    if (activity.status !== ActivityStatus.PROPUESTA) throw new BadRequestException('Inscripción cerrada');
    
    const existing = await this.prisma.participant.findUnique({
      where: { userId_activityId: { userId, activityId } }
    });

    if (existing) throw new BadRequestException('Ya registrado');
    if (activity._count.participants >= activity.maxParticipants) throw new BadRequestException('Sin cupos');

    return this.prisma.participant.create({ 
      data: { userId, activityId } 
    });
  }
}