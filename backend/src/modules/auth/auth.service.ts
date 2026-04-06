import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  // 1. LLAVES MAESTRAS (Asegúrate que coincidan con lo que escribes en el Front)
  private readonly MASTER_ADMIN_TOKEN = 'SIGAC_MASTER_2026';
  private readonly GLOBAL_PARTICIPANT_TOKEN = 'EQUIPO_BERNAL_2026';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registro con Validación de Triple Vía (Admin, Global o Sector)
   */
  async register(data: RegisterDto) {
    let assignedRole: Role = Role.COLABORADOR;
    let assignedSector: string = 'GENERAL';

    // Log para debuguear qué está llegando (Míralo en la terminal del backend)
    this.logger.log(`Intento de registro para: ${data.email} con código: ${data.inviteCode}`);

    // --- LÓGICA DE VALIDACIÓN DE CÓDIGOS ---
    
    // Vía A: Registro de nuevo COORDINADOR (Admin)
    if (data.inviteCode === this.MASTER_ADMIN_TOKEN) {
      assignedRole = Role.COORDINADOR;
      assignedSector = 'ADMINISTRACION';
    } 
    // Vía B: Registro de Colaborador GLOBAL
    else if (data.inviteCode === this.GLOBAL_PARTICIPANT_TOKEN) {
      assignedRole = Role.COLABORADOR;
      assignedSector = 'GENERAL';
    } 
    // Vía C: Registro por Código de Grupo (IT, Finanzas, etc.)
    else {
      // Si no es una llave maestra, buscamos en la tabla GroupCode de la DB
      const validGroupCode = await this.prisma.groupCode.findUnique({
        where: { code: data.inviteCode }
      });

      if (!validGroupCode) {
        throw new BadRequestException(
          'Código inválido. Verifica el código de invitación o solicita uno nuevo.'
        );
      }

      assignedRole = validGroupCode.role;
      assignedSector = validGroupCode.sector;

      // Actualizar contador de uso
      await this.prisma.groupCode.update({
        where: { id: validGroupCode.id },
        data: { usedCount: { increment: 1 } }
      });
    }

    // --- PROCESO DE CREACIÓN ---

    // 1. Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({ 
      where: { email: data.email } 
    });
    
    if (existingUser) {
      throw new BadRequestException('Este correo ya está registrado en SIGAC.');
    }

    // 2. Hashear contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Crear usuario en la base de datos
    try {
      return await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: assignedRole,
          sector: assignedSector,
        },
        select: { 
          id: true, 
          email: true, 
          name: true, 
          role: true, 
          sector: true 
        },
      });
    } catch (error) {
      this.logger.error(`Error al crear usuario: ${error.message}`);
      throw new BadRequestException('Error interno al crear la cuenta. Revisa la base de datos.');
    }
  }

  /**
   * Login con Inyección de Contexto (Rol y Sector)
   */
  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({ 
      where: { email: data.email } 
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Credenciales incorrectas. Verifique su acceso.');
    }
    
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      sector: user.sector 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        sector: user.sector
      },
    };
  }

  // --- MANTENIMIENTO ---

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'Si el correo existe, recibirá instrucciones.' };

    const token = Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 3600000); 

    await this.prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExp: expires },
    });

    return { message: 'Token de recuperación generado.', recoveryToken: token };
  }

  async resetPassword(token: string, newPass: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gt: new Date() } },
    });

    if (!user) throw new BadRequestException('Token inválido o expirado.');

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExp: null },
    });

    return { message: 'Contraseña actualizada correctamente.' };
  }
}