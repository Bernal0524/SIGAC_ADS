import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Genera un código de invitación único y lo registra en la DB
   */
  async generateInviteCode(sector: string) {
    const sectorUpper = sector.trim().toUpperCase();
    
    // Generamos un código único con el sector y un random de 4 dígitos
    const code = `SIGAC-${sectorUpper}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    return this.prisma.groupCode.create({
      data: {
        code,
        sector: sectorUpper,
        role: Role.COLABORADOR
      }
    });
  }

  /**
   * Lista todos los códigos para que el Admin supervise el uso por sector
   */
  async findAllCodes() {
    return this.prisma.groupCode.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Elimina un código de acceso (Útil si un sector se cierra o el código se filtra)
   */
  async deleteCode(id: string) {
    try {
      return await this.prisma.groupCode.delete({
        where: { id }
      });
    } catch (error) {
      throw new NotFoundException('El código que intentas eliminar no existe.');
    }
  }

  /**
   * REGLA DE ORO: Zero Overbooking
   * Retorna participantes que NO tengan actividades en el rango de tiempo solicitado.
   */
  async getAvailableParticipants(startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return this.prisma.user.findMany({
      where: {
        role: Role.COLABORADOR,
        registrations: {
          none: {
            activity: {
              // Si la actividad está PROPUESTA o CONFIRMADA, bloquea el horario
              status: { in: ['CONFIRMADA', 'PROPUESTA'] },
              // Lógica matemática de traslape: (StartA < EndB) AND (EndA > StartB)
              AND: [
                { startTime: { lt: end } },
                { endTime: { gt: start } }
              ]
            }
          }
        }
      },
      select: { 
        id: true, 
        name: true, 
        sector: true 
      },
      orderBy: { name: 'asc' }
    });
  }
}