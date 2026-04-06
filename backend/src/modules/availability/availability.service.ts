import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { ActivityStatus, Role } from '@prisma/client';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Sincronización Bulk: Borra y recrea las disponibilidades del usuario.
   * Ideal para el flujo de "Guardar Cambios" desde la interfaz.
   */
  async sync(userId: string, availabilities: CreateAvailabilityDto[]) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Limpiar disponibilidades actuales del usuario
      await tx.availability.deleteMany({ where: { userId } });

      // 2. Si el usuario borró todo, terminamos aquí
      if (availabilities.length === 0) return { count: 0 };

      // 3. Validar que no haya choques horarios dentro de la nueva lista
      this.validateInternalOverlaps(availabilities);

      // 4. Crear nuevas franjas asegurando tipos correctos
      const dataToCreate = availabilities.map((avail) => ({
        userId,
        dayOfWeek: Number(avail.dayOfWeek),
        startTime: new Date(avail.startTime),
        endTime: new Date(avail.endTime),
      }));

      return tx.availability.createMany({
        data: dataToCreate,
      });
    });
  }

  /**
   * Registro individual con validaciones de negocio.
   */
  async create(userId: string, dto: CreateAvailabilityDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la de fin');
    }

    // REGLA: No disponibilidad si hay actividad CONFIRMADA (como Admin o Participante)
    const activityConflict = await this.prisma.activity.findFirst({
      where: {
        status: ActivityStatus.CONFIRMADA,
        OR: [
          { participants: { some: { userId } } }, // Eres participante
          { adminId: userId }                    // Eres el organizador (Alexander/Rebe)
        ],
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } }
        ],
      },
    });

    if (activityConflict) {
      throw new BadRequestException('Traslape con actividad institucional confirmada');
    }

    // REGLA: Prevención de traslapes con disponibilidades ya guardadas
    const overlap = await this.prisma.availability.findFirst({
      where: {
        userId,
        dayOfWeek: Number(dto.dayOfWeek),
        OR: [
          { startTime: { lte: start }, endTime: { gt: start } },
          { startTime: { lt: end }, endTime: { gte: end } },
          { startTime: { gte: start }, endTime: { lte: end } },
        ],
      },
    });

    if (overlap) {
      throw new BadRequestException('Ya existe una franja de disponibilidad en este horario');
    }

    return this.prisma.availability.create({
      data: {
        userId,
        startTime: start,
        endTime: end,
        dayOfWeek: Number(dto.dayOfWeek),
      },
    });
  }

  /**
   * Consulta de Disponibilidad con lógica de roles SIGAC.
   */
  async findAll(userId: string, role: Role) {
    // Los coordinadores ven todo el catálogo para la orquestación
    if (role === Role.COORDINADOR) {
      return this.prisma.availability.findMany({
        include: { 
          user: { 
            select: { id: true, name: true, email: true, sector: true } 
          } 
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
    }

    // Los colaboradores solo ven su propia gestión
    return this.prisma.availability.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Eliminación con validación de autoría.
   */
  async remove(id: string, userId: string) {
    const availability = await this.prisma.availability.findUnique({ where: { id } });
    
    if (!availability) throw new NotFoundException('Registro no encontrado');
    if (availability.userId !== userId) throw new ForbiddenException('No autorizado para eliminar esta franja');

    return this.prisma.availability.delete({ where: { id } });
  }

  /**
   * Helper técnico para evitar traslapes en el array enviado desde el frontend.
   */
  private validateInternalOverlaps(availabilities: CreateAvailabilityDto[]) {
    for (let i = 0; i < availabilities.length; i++) {
      for (let j = i + 1; j < availabilities.length; j++) {
        const a = availabilities[i];
        const b = availabilities[j];

        if (Number(a.dayOfWeek) === Number(b.dayOfWeek)) {
          const startA = new Date(a.startTime).getTime();
          const endA = new Date(a.endTime).getTime();
          const startB = new Date(b.startTime).getTime();
          const endB = new Date(b.endTime).getTime();

          if (startA < endB && endA > startB) {
            throw new BadRequestException(
              `Conflicto en la lista: Dos franjas del mismo día se solapan.`
            );
          }
        }
      }
    }
  }
}