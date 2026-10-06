import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

describe('AuthController', () => {
  let authService: {
    register: jest.Mock<AuthService['register']>;
    login: jest.Mock<AuthService['login']>;
    refresh: jest.Mock<AuthService['refresh']>;
    logout: jest.Mock<AuthService['logout']>;
  };
  let controller: AuthController;

  beforeEach(() => {
    authService = {
      register: jest.fn<AuthService['register']>(),
      login: jest.fn<AuthService['login']>(),
      refresh: jest.fn<AuthService['refresh']>(),
      logout: jest.fn<AuthService['logout']>(),
    };

    controller = new AuthController(authService as unknown as AuthService);
  });

  // Tradução: deve encaminhar os dados de cadastro para o serviço de autenticação.
  it('should forward the registration data to the authentication service', async () => {
    // Mocks: definem a entrada e a resposta esperada do serviço.
    const dto = { email: 'ana@example.com', password: 'password-123' };
    const expectedResult = {
      email: dto.email,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    authService.register.mockResolvedValue(expectedResult);

    // Chamada: executa somente o método público do controller.
    const result = await controller.register(dto);

    // Resultados: verifica a delegação e o valor devolvido.
    expect(authService.register).toHaveBeenCalledTimes(1);
    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });

  // Tradução: deve encaminhar as credenciais de login para o serviço de autenticação.
  it('should forward the login credentials to the authentication service', async () => {
    // Mocks
    const dto = { email: 'ana@example.com', password: 'password-123' };
    const expectedResult = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    authService.login.mockResolvedValue(expectedResult);

    // Chamada
    const result = await controller.login(dto);

    // Resultados
    expect(authService.login).toHaveBeenCalledTimes(1);
    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });

  // Tradução: deve encaminhar apenas o refresh token para o serviço de autenticação.
  it('should forward only the refresh token to the authentication service', async () => {
    // Mocks
    const body = { refreshToken: 'refresh-token' };
    const expectedResult = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };
    authService.refresh.mockResolvedValue(expectedResult);

    // Chamada
    const result = await controller.refresh(body);

    // Resultados
    expect(authService.refresh).toHaveBeenCalledTimes(1);
    expect(authService.refresh).toHaveBeenCalledWith(body.refreshToken);
    expect(result).toEqual(expectedResult);
  });

  // Tradução: deve encaminhar o ID do usuário autenticado para o serviço de autenticação.
  it('should forward the authenticated user ID to the authentication service', async () => {
    // Mocks
    const request = {
      user: { sub: 'user-1', email: 'ana@example.com' },
    } as Parameters<AuthController['logout']>[0];
    const expectedResult = { message: 'Logout realizado' };
    authService.logout.mockResolvedValue(expectedResult);

    // Chamada
    const result = await controller.logout(request);

    // Resultados
    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(authService.logout).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(expectedResult);
  });
});
