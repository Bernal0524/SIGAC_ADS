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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let GroupsService = class GroupsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateInviteCode(sector) {
        const sectorUpper = sector.trim().toUpperCase();
        const code = `SIGAC-${sectorUpper}-${Math.floor(1000 + Math.random() * 9000)}`;
        return this.prisma.groupCode.create({
            data: {
                code,
                sector: sectorUpper,
                role: client_1.Role.COLABORADOR
            }
        });
    }
    async findAllCodes() {
        return this.prisma.groupCode.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async deleteCode(id) {
        try {
            return await this.prisma.groupCode.delete({
                where: { id }
            });
        }
        catch (error) {
            throw new common_1.NotFoundException('El código que intentas eliminar no existe.');
        }
    }
    async getAvailableParticipants(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        return this.prisma.user.findMany({
            where: {
                role: client_1.Role.COLABORADOR,
                registrations: {
                    none: {
                        activity: {
                            status: { in: ['CONFIRMADA', 'PROPUESTA'] },
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
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map