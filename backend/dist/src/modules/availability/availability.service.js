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
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let AvailabilityService = class AvailabilityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sync(userId, availabilities) {
        return this.prisma.$transaction(async (tx) => {
            await tx.availability.deleteMany({ where: { userId } });
            if (availabilities.length === 0)
                return { count: 0 };
            this.validateInternalOverlaps(availabilities);
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
    async create(userId, dto) {
        const start = new Date(dto.startTime);
        const end = new Date(dto.endTime);
        if (start >= end) {
            throw new common_1.BadRequestException('La hora de inicio debe ser anterior a la de fin');
        }
        const activityConflict = await this.prisma.activity.findFirst({
            where: {
                status: client_1.ActivityStatus.CONFIRMADA,
                OR: [
                    { participants: { some: { userId } } },
                    { adminId: userId }
                ],
                AND: [
                    { startTime: { lt: end } },
                    { endTime: { gt: start } }
                ],
            },
        });
        if (activityConflict) {
            throw new common_1.BadRequestException('Traslape con actividad institucional confirmada');
        }
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
            throw new common_1.BadRequestException('Ya existe una franja de disponibilidad en este horario');
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
    async findAll(userId, role) {
        if (role === client_1.Role.COORDINADOR) {
            return this.prisma.availability.findMany({
                include: {
                    user: {
                        select: { id: true, name: true, email: true, sector: true }
                    }
                },
                orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            });
        }
        return this.prisma.availability.findMany({
            where: { userId },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        });
    }
    async remove(id, userId) {
        const availability = await this.prisma.availability.findUnique({ where: { id } });
        if (!availability)
            throw new common_1.NotFoundException('Registro no encontrado');
        if (availability.userId !== userId)
            throw new common_1.ForbiddenException('No autorizado para eliminar esta franja');
        return this.prisma.availability.delete({ where: { id } });
    }
    validateInternalOverlaps(availabilities) {
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
                        throw new common_1.BadRequestException(`Conflicto en la lista: Dos franjas del mismo día se solapan.`);
                    }
                }
            }
        }
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map