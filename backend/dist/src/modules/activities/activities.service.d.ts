import { PrismaService } from '../../database/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityStatus, Role } from '@prisma/client';
export declare class ActivitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(adminId: string, dto: CreateActivityDto & {
        participantIds?: string[];
    }): Promise<{
        _count: {
            participants: number;
        };
        participants: ({
            user: {
                name: string;
                email: string;
                id: string;
                sector: string;
            };
        } & {
            id: string;
            userId: string;
            joinedAt: Date;
            activityId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        location: string;
        startTime: Date;
        endTime: Date;
        maxParticipants: number;
        minQuorum: number;
        status: import(".prisma/client").$Enums.ActivityStatus;
        adminId: string;
    }>;
    findOne(id: string, userId: string, role: Role): Promise<{
        _count: {
            participants: number;
        };
        admin: {
            name: string;
            id: string;
            sector: string;
        };
        participants: ({
            user: {
                name: string;
                email: string;
                id: string;
                sector: string;
            };
        } & {
            id: string;
            userId: string;
            joinedAt: Date;
            activityId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        location: string;
        startTime: Date;
        endTime: Date;
        maxParticipants: number;
        minQuorum: number;
        status: import(".prisma/client").$Enums.ActivityStatus;
        adminId: string;
    }>;
    updateActivity(activityId: string, adminId: string, dto: any): Promise<{
        _count: {
            participants: number;
        };
        participants: ({
            user: {
                name: string;
                sector: string;
            };
        } & {
            id: string;
            userId: string;
            joinedAt: Date;
            activityId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        location: string;
        startTime: Date;
        endTime: Date;
        maxParticipants: number;
        minQuorum: number;
        status: import(".prisma/client").$Enums.ActivityStatus;
        adminId: string;
    }>;
    updateStatus(activityId: string, adminId: string, status: ActivityStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        location: string;
        startTime: Date;
        endTime: Date;
        maxParticipants: number;
        minQuorum: number;
        status: import(".prisma/client").$Enums.ActivityStatus;
        adminId: string;
    }>;
    findAll(userId: string, role: Role): Promise<({
        _count: {
            participants: number;
        };
        admin: {
            name: string;
            sector: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        location: string;
        startTime: Date;
        endTime: Date;
        maxParticipants: number;
        minQuorum: number;
        status: import(".prisma/client").$Enums.ActivityStatus;
        adminId: string;
    })[]>;
    deleteActivity(activityId: string, adminId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        location: string;
        startTime: Date;
        endTime: Date;
        maxParticipants: number;
        minQuorum: number;
        status: import(".prisma/client").$Enums.ActivityStatus;
        adminId: string;
    }>;
    getAvailableParticipants(startStr: string, endStr: string): Promise<{
        name: string;
        email: string;
        id: string;
        sector: string;
    }[]>;
    joinActivity(userId: string, activityId: string): Promise<{
        id: string;
        userId: string;
        joinedAt: Date;
        activityId: string;
    }>;
}
