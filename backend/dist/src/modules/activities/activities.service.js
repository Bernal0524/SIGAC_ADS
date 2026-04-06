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
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let ActivitiesService = class ActivitiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(adminId, dto) {
        const start = new Date(dto.startTime);
        const end = new Date(dto.endTime);
        if (start < new Date())
            throw new common_1.BadRequestException('La fecha no puede ser en el pasado');
        if (start >= end)
            throw new common_1.BadRequestException('La hora de inicio debe ser menor a la de fin');
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
                status: client_1.ActivityStatus.PROPUESTA,
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
    async findOne(id, userId, role) {
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
        if (!activity)
            throw new common_1.NotFoundException('Orquestación no encontrada');
        if (role === client_1.Role.COORDINADOR && activity.adminId !== userId) {
            throw new common_1.ForbiddenException('No tienes acceso a esta actividad');
        }
        return activity;
    }
    async updateActivity(activityId, adminId, dto) {
        const activity = await this.prisma.activity.findUnique({
            where: { id: activityId },
            include: { participants: true }
        });
        if (!activity)
            throw new common_1.NotFoundException('Actividad no encontrada');
        if (activity.adminId !== adminId)
            throw new common_1.ForbiddenException('No autorizado');
        if (activity.status !== client_1.ActivityStatus.PROPUESTA) {
            throw new common_1.BadRequestException(`No se permite editar: La actividad está en ${activity.status}`);
        }
        const { participantIds, ...data } = dto;
        const updateData = {
            ...data,
            maxParticipants: data.maxParticipants !== undefined ? Number(data.maxParticipants) : undefined,
            minQuorum: data.minQuorum !== undefined ? Number(data.minQuorum) : undefined,
            startTime: data.startTime ? new Date(data.startTime) : undefined,
            endTime: data.endTime ? new Date(data.endTime) : undefined,
        };
        if (participantIds) {
            updateData.participants = {
                deleteMany: {},
                create: participantIds.map((id) => ({ userId: id }))
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
    async updateStatus(activityId, adminId, status) {
        const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });
        if (!activity || activity.adminId !== adminId)
            throw new common_1.ForbiddenException('No autorizado');
        if (activity.status === client_1.ActivityStatus.CANCELADA || activity.status === client_1.ActivityStatus.FINALIZADA) {
            throw new common_1.BadRequestException('La actividad ya está cerrada');
        }
        return this.prisma.activity.update({
            where: { id: activityId },
            data: { status }
        });
    }
    async findAll(userId, role) {
        return this.prisma.activity.findMany({
            where: role === client_1.Role.COORDINADOR ? { adminId: userId } : {},
            include: {
                admin: { select: { name: true, sector: true } },
                _count: { select: { participants: true } }
            },
            orderBy: { startTime: 'asc' }
        });
    }
    async deleteActivity(activityId, adminId) {
        const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });
        if (!activity)
            throw new common_1.NotFoundException('Actividad no encontrada');
        if (activity.adminId !== adminId)
            throw new common_1.ForbiddenException('No autorizado');
        return this.prisma.activity.delete({ where: { id: activityId } });
    }
    async getAvailableParticipants(startStr, endStr) {
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (isNaN(start.getTime()) || isNaN(end.getTime()))
            throw new common_1.BadRequestException('Fechas inválidas');
        return this.prisma.user.findMany({
            where: {
                role: client_1.Role.COLABORADOR,
                availabilities: {
                    some: { startTime: { lte: start }, endTime: { gte: end } }
                },
                registrations: {
                    none: {
                        activity: {
                            status: { in: [client_1.ActivityStatus.PROPUESTA, client_1.ActivityStatus.CONFIRMADA] },
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
    async joinActivity(userId, activityId) {
        const activity = await this.prisma.activity.findUnique({
            where: { id: activityId },
            include: { _count: { select: { participants: true } } },
        });
        if (!activity)
            throw new common_1.NotFoundException('Actividad no encontrada');
        if (activity.status !== client_1.ActivityStatus.PROPUESTA)
            throw new common_1.BadRequestException('Inscripción cerrada');
        const existing = await this.prisma.participant.findUnique({
            where: { userId_activityId: { userId, activityId } }
        });
        if (existing)
            throw new common_1.BadRequestException('Ya registrado');
        if (activity._count.participants >= activity.maxParticipants)
            throw new common_1.BadRequestException('Sin cupos');
        return this.prisma.participant.create({
            data: { userId, activityId }
        });
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map