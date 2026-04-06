import { PrismaService } from '../../database/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { Role } from '@prisma/client';
export declare class AvailabilityService {
    private prisma;
    constructor(prisma: PrismaService);
    sync(userId: string, availabilities: CreateAvailabilityDto[]): Promise<{
        count: number;
    }>;
    create(userId: string, dto: CreateAvailabilityDto): Promise<{
        userId: string;
        dayOfWeek: number;
        startTime: Date;
        endTime: Date;
        id: string;
    }>;
    findAll(userId: string, role: Role): Promise<{
        userId: string;
        dayOfWeek: number;
        startTime: Date;
        endTime: Date;
        id: string;
    }[]>;
    remove(id: string, userId: string): Promise<{
        userId: string;
        dayOfWeek: number;
        startTime: Date;
        endTime: Date;
        id: string;
    }>;
    private validateInternalOverlaps;
}
