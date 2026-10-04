import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<import("./interfaces/jwt-payload.interface").AuthResponse>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import("../database/entities").RoleType;
        isActive: boolean;
        createdAt: Date;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
