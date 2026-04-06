import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { Role } from '@prisma/client';
export declare class AvailabilityController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
    sync(userId: string, dto: {
        availabilities: CreateAvailabilityDto[];
    }): Promise<{
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
    remove(userId: string, id: string): Promise<{
        userId: string;
        dayOfWeek: number;
        startTime: Date;
        endTime: Date;
        id: string;
    }>;
}
