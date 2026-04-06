"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger('AuthService');
        this.MASTER_ADMIN_TOKEN = 'SIGAC_MASTER_2026';
        this.GLOBAL_PARTICIPANT_TOKEN = 'EQUIPO_BERNAL_2026';
    }
    async register(data) {
        let assignedRole = client_1.Role.COLABORADOR;
        let assignedSector = 'GENERAL';
        this.logger.log(`Intento de registro para: ${data.email} con código: ${data.inviteCode}`);
        if (data.inviteCode === this.MASTER_ADMIN_TOKEN) {
            assignedRole = client_1.Role.COORDINADOR;
            assignedSector = 'ADMINISTRACION';
        }
        else if (data.inviteCode === this.GLOBAL_PARTICIPANT_TOKEN) {
            assignedRole = client_1.Role.COLABORADOR;
            assignedSector = 'GENERAL';
        }
        else {
            const validGroupCode = await this.prisma.groupCode.findUnique({
                where: { code: data.inviteCode }
            });
            if (!validGroupCode) {
                throw new common_1.BadRequestException('Código inválido. Verifica el código de invitación o solicita uno nuevo.');
            }
            assignedRole = validGroupCode.role;
            assignedSector = validGroupCode.sector;
            await this.prisma.groupCode.update({
                where: { id: validGroupCode.id },
                data: { usedCount: { increment: 1 } }
            });
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Este correo ya está registrado en SIGAC.');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
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
        }
        catch (error) {
            this.logger.error(`Error al crear usuario: ${error.message}`);
            throw new common_1.BadRequestException('Error interno al crear la cuenta. Revisa la base de datos.');
        }
    }
    async login(data) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (!user || !(await bcrypt.compare(data.password, user.password))) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas. Verifique su acceso.');
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
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            return { message: 'Si el correo existe, recibirá instrucciones.' };
        const token = Math.random().toString(36).substring(2, 15);
        const expires = new Date(Date.now() + 3600000);
        await this.prisma.user.update({
            where: { email },
            data: { resetToken: token, resetTokenExp: expires },
        });
        return { message: 'Token de recuperación generado.', recoveryToken: token };
    }
    async resetPassword(token, newPass) {
        const user = await this.prisma.user.findFirst({
            where: { resetToken: token, resetTokenExp: { gt: new Date() } },
        });
        if (!user)
            throw new common_1.BadRequestException('Token inválido o expirado.');
        const hashedPassword = await bcrypt.hash(newPass, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, resetToken: null, resetTokenExp: null },
        });
        return { message: 'Contraseña actualizada correctamente.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map