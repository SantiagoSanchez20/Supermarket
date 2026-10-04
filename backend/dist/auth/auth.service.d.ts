import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './interfaces/jwt-payload.interface';
export declare class AuthService {
    private readonly userRepo;
    private readonly jwtService;
    constructor(userRepo: Repository<User>, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<User>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import("../database/entities").RoleType;
        isActive: boolean;
        createdAt: Date;
    }>;
}
