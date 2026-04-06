import { GroupsService } from './groups.service';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    generateCode(data: {
        sector: string;
    }): Promise<{
        id: string;
        code: string;
        sector: string;
        role: import(".prisma/client").$Enums.Role;
        usedCount: number;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        code: string;
        sector: string;
        role: import(".prisma/client").$Enums.Role;
        usedCount: number;
        createdAt: Date;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        code: string;
        sector: string;
        role: import(".prisma/client").$Enums.Role;
        usedCount: number;
        createdAt: Date;
    }>;
    getAvailable(start: string, end: string): Promise<{
        name: string;
        id: string;
        sector: string;
    }[]>;
}
