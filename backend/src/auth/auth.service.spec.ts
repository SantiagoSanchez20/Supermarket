import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../database/entities/user.entity';
import { Role, RoleType } from '../database/entities/role.entity';

describe('AuthService (Pruebas Unitarias de Autenticación)', () => {
  let authService: AuthService;
  let userRepoMock: any;
  let jwtServiceMock: any;

  const mockAdminRole: Role = {
    id: 'role-admin-id',
    name: RoleType.ADMIN,
    description: 'Admin',
    users: [],
  };

  const hashedPassword = bcrypt.hashSync('Password123!', 10);

  const mockUser: User = {
    id: 'user-uuid-123',
    email: 'test@smartmarket.com',
    passwordHash: hashedPassword,
    fullName: 'Usuario de Prueba',
    roleId: mockAdminRole.id,
    role: mockAdminRole,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sales: [],
    inventoryMovements: [],
  };

  beforeEach(() => {
    userRepoMock = {
      findOne: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock-jwt-token-xyz'),
    };

    authService = new AuthService(userRepoMock as any, jwtServiceMock as any);
  });

  it('debe iniciar sesión exitosamente con credenciales válidas y devolver un JWT', async () => {
    userRepoMock.findOne.mockResolvedValue(mockUser);

    const result = await authService.login({
      email: 'test@smartmarket.com',
      password: 'Password123!',
    });

    expect(result).toBeDefined();
    expect(result.accessToken).toBe('mock-jwt-token-xyz');
    expect(result.user.email).toBe('test@smartmarket.com');
    expect(result.user.role).toBe(RoleType.ADMIN);
  });

  it('debe rechazar el inicio de sesión con contraseña incorrecta (UnauthorizedException)', async () => {
    userRepoMock.findOne.mockResolvedValue(mockUser);

    await expect(
      authService.login({
        email: 'test@smartmarket.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('debe rechazar el inicio de sesión con usuario inexistente', async () => {
    userRepoMock.findOne.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'inexistente@smartmarket.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('debe rechazar el inicio de sesión si el usuario está inactivo', async () => {
    const inactiveUser = { ...mockUser, isActive: false };
    userRepoMock.findOne.mockResolvedValue(inactiveUser);

    await expect(
      authService.login({
        email: 'test@smartmarket.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('debe retornar el perfil del usuario autenticado', async () => {
    userRepoMock.findOne.mockResolvedValue(mockUser);

    const profile = await authService.getProfile('user-uuid-123');

    expect(profile).toBeDefined();
    expect(profile.email).toBe('test@smartmarket.com');
    expect(profile.role).toBe(RoleType.ADMIN);
  });
});
