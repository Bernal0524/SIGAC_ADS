import { ActivityStatus } from '@prisma/client';
export declare class CreateActivityDto {
    title: string;
    description?: string;
    location: string;
    startTime: string;
    endTime: string;
    maxParticipants: number;
    minQuorum: number;
}
export declare class UpdateActivityStatusDto {
    status: ActivityStatus;
}
