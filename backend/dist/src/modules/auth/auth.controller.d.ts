import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    forgotPassword(data: ForgotPasswordDto): Promise<{
        message: string;
        recoveryToken?: undefined;
    } | {
        message: string;
        recoveryToken: string;
    }>;
    resetPassword(data: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getProfile(user: any): any;
}
