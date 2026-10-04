import { Role } from './role.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    roleId: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
