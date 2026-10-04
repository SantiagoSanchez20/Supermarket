import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { RoleType } from '../../database/entities';

describe('RolesGuard (Verificación de Autorización RBAC en Backend)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (userRole?: RoleType): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userRole ? { role: userRole } : null,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('debe permitir acceso si la ruta no tiene restricción de roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext(RoleType.CAJERO);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debe permitir acceso al usuario si posee uno de los roles requeridos', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.ADMIN]);
    const context = createMockContext(RoleType.ADMIN);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debe lanzar ForbiddenException si el usuario NO tiene el rol requerido', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.ADMIN]);
    const context = createMockContext(RoleType.CAJERO);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('No tiene permisos para realizar esta operación.');
  });

  it('debe lanzar ForbiddenException si el usuario no tiene rol asignado o no está en la petición', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.ADMIN]);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('No tiene permisos para realizar esta operación.');
  });
});
