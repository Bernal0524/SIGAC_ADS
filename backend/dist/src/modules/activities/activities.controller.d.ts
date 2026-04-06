import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityStatusDto } from './dto/create-activity.dto';
import { Role } from '@prisma/client';
export declare class ActivitiesController {
    private readonly activitiesService;
    constructor(activitiesService: ActivitiesService);
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
    getAvailable(start: string, end: string): Promise<{
        name: string;
        email: string;
        id: string;
        sector: string;
    }[]>;
    create(userId: string, dto: CreateActivityDto & {
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
    join(userId: string, activityId: string): Promise<{
        id: string;
        userId: string;
        joinedAt: Date;
        activityId: string;
    }>;
    updateStatus(activityId: string, adminId: string, dto: UpdateActivityStatusDto): Promise<{
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
    updateActivity(activityId: string, adminId: string, dto: Partial<CreateActivityDto> & {
        participantIds?: string[];
    }): Promise<{
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
    remove(activityId: string, adminId: string): Promise<{
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
}
