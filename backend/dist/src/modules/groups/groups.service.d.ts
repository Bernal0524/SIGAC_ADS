import { PrismaService } from '../../database/prisma.service';
export declare class GroupsService {
    private prisma;
    constructor(prisma: PrismaService);
    generateInviteCode(sector: string): Promise<{
        id: string;
        code: string;
        sector: string;
        role: import(".prisma/client").$Enums.Role;
        usedCount: number;
        createdAt: Date;
    }>;
    findAllCodes(): Promise<{
        id: string;
        code: string;
        sector: string;
        role: import(".prisma/client").$Enums.Role;
        usedCount: number;
        createdAt: Date;
    }[]>;
    deleteCode(id: string): Promise<{
        id: string;
        code: string;
        sector: string;
        role: import(".prisma/client").$Enums.Role;
        usedCount: number;
        createdAt: Date;
    }>;
    getAvailableParticipants(startTime: string, endTime: string): Promise<{
        name: string;
        id: string;
        sector: string;
    }[]>;
}
