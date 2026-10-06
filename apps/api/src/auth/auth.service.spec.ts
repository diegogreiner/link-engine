import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { PrismaService } from 'src/prisma/service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let prisma: {
    user: {
      findUnique: jest.Mock<(args: unknown) => Promise<any>>;
      create: jest.Mock<(args: unknown) => Promise<any>>;
    };
    refreshToken: {
      create: jest.Mock<(args: unknown) => Promise<any>>;
      findMany: jest.Mock<(args: unknown) => Promise<any[]>>;
      delete: jest.Mock<(args: unknown) => Promise<any>>;
      deleteMany: jest.Mock<(args: unknown) => Promise<any>>;
    };
  };
  let jwt: {
    signAsync: jest.Mock<
      (payload: unknown, options: unknown) => Promise<string>
    >;
    verifyAsync: jest.Mock<(token: string, options: unknown) => Promise<any>>;
  };
  let configService: {
    get: jest.Mock<(key: string) => string | undefined>;
  };
  let service: AuthService;
  let hash: jest.MockedFunction<typeof bcrypt.hash>;
  let compare: jest.MockedFunction<typeof bcrypt.compare>;

  const user = {
    id: 'user-1',
    email: 'ana@example.com',
    passwordHash: 'stored-password-hash',
  };
  const registerDto = {
    email: user.email,
    password: 'password-123',
  };
  const config = {
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_ACCESS_EXPIRES: '15m',
    JWT_REFRESH_SECRET: 'refresh-secret',
    JWT_REFRESH_EXPIRES: '7d',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    prisma = {
      user: {
        findUnique: jest.fn<(args: unknown) => Promise<any>>(),
        create: jest.fn<(args: unknown) => Promise<any>>(),
      },
      refreshToken: {
        create: jest.fn<(args: unknown) => Promise<any>>(),
        findMany: jest.fn<(args: unknown) => Promise<any[]>>(),
        delete: jest.fn<(args: unknown) => Promise<any>>(),
        deleteMany: jest.fn<(args: unknown) => Promise<any>>(),
      },
    };
    jwt = {
      signAsync:
        jest.fn<(payload: unknown, options: unknown) => Promise<string>>(),
      verifyAsync: jest.fn<(token: string, options: unknown) => Promise<any>>(),
    };
    configService = {
      get: jest.fn<(key: string) => string | undefined>((key) => config[key]),
    };
    hash = jest.mocked(bcrypt.hash);
    compare = jest.mocked(bcrypt.compare);

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  function mockGeneratedTokens() {
    jwt.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    hash
      .mockResolvedValueOnce('password-hash' as never)
      .mockResolvedValueOnce('refresh-token-hash' as never);
  }

  // Tradução: deve criar um usuário quando o e-mail estiver disponível.
  it('should create a user when the email is available', async () => {
    // Mocks
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);
    mockGeneratedTokens();

    // Chamada
    const result = await service.register(registerDto);

    // Resultados
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { email: user.email, passwordHash: 'password-hash' },
    });
    expect(result).toEqual({
      email: user.email,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  // Tradução: deve armazenar o hash da senha e nunca a senha original.
  it('should store the password hash and never the raw password', async () => {
    // Mocks
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);
    mockGeneratedTokens();

    // Chamada
    await service.register(registerDto);

    // Resultados
    expect(hash).toHaveBeenNthCalledWith(1, registerDto.password, 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: registerDto.email,
        passwordHash: 'password-hash',
      },
    });
    expect(prisma.user.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ passwordHash: registerDto.password }),
      }),
    );
  });

  // Tradução: deve rejeitar o cadastro quando o e-mail já estiver registrado.
  it('should reject registration when the email is already registered', async () => {
    // Mocks
    prisma.user.findUnique.mockResolvedValue(user);

    // Chamada
    const promise = service.register(registerDto);

    // Resultados
    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    expect(hash).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  // Tradução: deve gerar os dois tokens e persistir somente o hash do refresh token.
  it('should generate both tokens and persist only the refresh token hash', async () => {
    // Mocks
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);
    mockGeneratedTokens();

    // Chamada
    await service.register(registerDto);

    // Resultados
    expect(jwt.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: user.id, email: user.email },
      { secret: 'access-secret', expiresIn: '15m' },
    );
    expect(jwt.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: user.id, email: user.email },
      { secret: 'refresh-secret', expiresIn: '7d' },
    );
    expect(hash).toHaveBeenNthCalledWith(2, 'refresh-token', 10);
    expect(prisma.refreshToken.create).toHaveBeenCalledWith({
      data: {
        userId: user.id,
        token: 'refresh-token-hash',
        expiresAt: expect.any(Date),
      },
    });
  });

  // Tradução: deve devolver tokens quando as credenciais forem válidas.
  it('should return tokens when the credentials are valid', async () => {
    // Mocks
    prisma.user.findUnique.mockResolvedValue(user);
    compare.mockResolvedValue(true as never);
    jwt.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    hash.mockResolvedValue('refresh-token-hash' as never);

    // Chamada
    const result = await service.login(registerDto);

    // Resultados
    expect(compare).toHaveBeenCalledWith(
      registerDto.password,
      user.passwordHash,
    );
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  // Tradução: deve rejeitar o login quando o usuário não existir.
  it('should reject login when the user does not exist', async () => {
    // Mocks
    prisma.user.findUnique.mockResolvedValue(null);

    // Chamada
    const promise = service.login(registerDto);

    // Resultados
    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    expect(compare).not.toHaveBeenCalled();
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  // Tradução: deve rejeitar o login quando a senha estiver incorreta.
  it('should reject login when the password is incorrect', async () => {
    // Mocks
    prisma.user.findUnique.mockResolvedValue(user);
    compare.mockResolvedValue(false as never);

    // Chamada
    const promise = service.login(registerDto);

    // Resultados
    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    expect(compare).toHaveBeenCalledWith(
      registerDto.password,
      user.passwordHash,
    );
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  // Tradução: deve verificar o refresh token usando o segredo específico de refresh.
  it('should verify the refresh token with the refresh secret', async () => {
    // Mocks
    jwt.verifyAsync.mockResolvedValue({ sub: user.id, email: user.email });
    prisma.refreshToken.findMany.mockResolvedValue([
      { id: 'stored-token-1', token: 'stored-refresh-hash' },
    ]);
    compare.mockResolvedValue(true as never);
    jwt.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');
    hash.mockResolvedValue('new-refresh-hash' as never);

    // Chamada
    await service.refresh('presented-refresh-token');

    // Resultados
    expect(jwt.verifyAsync).toHaveBeenCalledWith('presented-refresh-token', {
      secret: 'refresh-secret',
    });
  });

  // Tradução: deve apagar o token anterior e criar um novo ao renovar a sessão.
  it('should delete the previous token and create a new one when refreshing', async () => {
    // Mocks
    jwt.verifyAsync.mockResolvedValue({ sub: user.id, email: user.email });
    prisma.refreshToken.findMany.mockResolvedValue([
      { id: 'stored-token-1', token: 'stored-refresh-hash' },
    ]);
    compare.mockResolvedValue(true as never);
    jwt.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');
    hash.mockResolvedValue('new-refresh-hash' as never);

    // Chamada
    const result = await service.refresh('presented-refresh-token');

    // Resultados
    expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
      where: { id: 'stored-token-1' },
    });
    expect(prisma.refreshToken.create).toHaveBeenCalledWith({
      data: {
        userId: user.id,
        token: 'new-refresh-hash',
        expiresAt: expect.any(Date),
      },
    });
    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  // Tradução: deve rejeitar um refresh token inválido ou expirado.
  it('should reject an invalid or expired refresh token', async () => {
    // Mocks
    jwt.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    // Chamada
    const promise = service.refresh('expired-refresh-token');

    // Resultados
    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.refreshToken.findMany).not.toHaveBeenCalled();
  });

  // Tradução: deve rejeitar um refresh token válido no JWT, mas desconhecido no banco.
  it('should reject a refresh token that is unknown to the database', async () => {
    // Mocks
    jwt.verifyAsync.mockResolvedValue({ sub: user.id, email: user.email });
    prisma.refreshToken.findMany.mockResolvedValue([]);

    // Chamada
    const promise = service.refresh('unknown-refresh-token');

    // Resultados
    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.refreshToken.delete).not.toHaveBeenCalled();
  });

  // Tradução: deve rejeitar um refresh token reutilizado que não corresponde ao hash salvo.
  it('should reject a reused refresh token that does not match the stored hash', async () => {
    // Mocks
    jwt.verifyAsync.mockResolvedValue({ sub: user.id, email: user.email });
    prisma.refreshToken.findMany.mockResolvedValue([
      { id: 'stored-token-1', token: 'another-refresh-hash' },
    ]);
    compare.mockResolvedValue(false as never);

    // Chamada
    const promise = service.refresh('reused-refresh-token');

    // Resultados
    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.refreshToken.delete).not.toHaveBeenCalled();
  });

  // Tradução: deve remover todos os refresh tokens pertencentes ao usuário.
  it('should remove every refresh token that belongs to the user', async () => {
    // Mocks
    prisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

    // Chamada
    const result = await service.logout(user.id);

    // Resultados
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: user.id },
    });
    expect(result).toEqual({ message: 'Logout realizado' });
  });
});
