import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private readonly logger;
    private readonly MASTER_ADMIN_TOKEN;
    private readonly GLOBAL_PARTICIPANT_TOKEN;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(data: RegisterDto): Promise<{
        name: string;
        email: string;
        id: string;
        sector: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    login(data: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            sector: string;
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
        recoveryToken?: undefined;
    } | {
        message: string;
        recoveryToken: string;
    }>;
    resetPassword(token: string, newPass: string): Promise<{
        message: string;
    }>;
}
