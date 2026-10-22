import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { GoneException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import type { AnalyticsCacheService } from 'src/analytics/analytics-cache.service';
import type { PrismaService } from 'src/prisma/service';
import { LinksService } from './links.service';

jest.mock('nanoid', () => ({ nanoid: jest.fn() }));

describe('LinksService', () => {
  let prisma: {
    link: {
      create: jest.Mock<(args: any) => Promise<any>>;
      findUnique: jest.Mock<(args: any) => Promise<any>>;
      findFirst: jest.Mock<(args: any) => Promise<any>>;
      findMany: jest.Mock<(args: any) => Promise<any[]>>;
      updateMany: jest.Mock<(args: any) => Promise<{ count: number }>>;
      deleteMany: jest.Mock<(args: any) => Promise<{ count: number }>>;
    };
    linkAccess: {
      create: jest.Mock<(args: any) => Promise<any>>;
    };
  };
  let analyticsCache: {
    invalidateAnalyticsCache: jest.Mock<
      (userId: string, linkId: string) => Promise<void>
    >;
    deleteAnalyticsCacheVersion: jest.Mock<
      (userId: string, linkId: string) => Promise<void>
    >;
  };
  let service: LinksService;
  let nanoidMock: jest.MockedFunction<typeof nanoid>;

  const userId = 'user-1';
  const linkId = 'link-1';
  const activeLink = {
    id: linkId,
    userId,
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    expiresAt: null,
    ga4MeasurementId: null,
    createdAt: new Date('2026-09-01T10:00:00.000Z'),
    updatedAt: new Date('2026-09-01T10:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = {
      link: {
        create: jest.fn<(args: any) => Promise<any>>(),
        findUnique: jest.fn<(args: any) => Promise<any>>(),
        findFirst: jest.fn<(args: any) => Promise<any>>(),
        findMany: jest.fn<(args: any) => Promise<any[]>>(),
        updateMany: jest.fn<(args: any) => Promise<{ count: number }>>(),
        deleteMany: jest.fn<(args: any) => Promise<{ count: number }>>(),
      },
      linkAccess: {
        create: jest.fn<(args: any) => Promise<any>>(),
      },
    };
    analyticsCache = {
      invalidateAnalyticsCache:
        jest.fn<(userId: string, linkId: string) => Promise<void>>(),
      deleteAnalyticsCacheVersion:
        jest.fn<(userId: string, linkId: string) => Promise<void>>(),
    };
    nanoidMock = jest.mocked(nanoid);
    service = new LinksService(
      prisma as unknown as PrismaService,
      analyticsCache as unknown as AnalyticsCacheService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Tradução: deve criar um link para o usuário e converter a data de expiração.
  it('should create a link for the user and convert the expiration date', async () => {
    // Mocks
    const dto = {
      originalUrl: 'https://example.com',
      expiresAt: '2026-12-31T23:59:59.000Z',
      ga4MeasurementId: 'G-ABC123',
    };
    nanoidMock.mockReturnValue('abc123');
    prisma.link.findUnique.mockResolvedValue(null);
    prisma.link.create.mockResolvedValue(activeLink);

    // Chamada
    const result = await service.create(dto, userId);

    // Resultados
    expect(prisma.link.create).toHaveBeenCalledWith({
      data: {
        userId,
        shortCode: 'abc123',
        originalUrl: dto.originalUrl,
        expiresAt: new Date(dto.expiresAt),
        ga4MeasurementId: dto.ga4MeasurementId,
      },
    });
    expect(result).toBe(activeLink);
  });

  // Tradução: deve armazenar como nulos os campos opcionais não informados.
  it('should store omitted optional fields as null', async () => {
    // Mocks
    nanoidMock.mockReturnValue('abc123');
    prisma.link.findUnique.mockResolvedValue(null);
    prisma.link.create.mockResolvedValue(activeLink);

    // Chamada
    await service.create({ originalUrl: activeLink.originalUrl }, userId);

    // Resultados
    expect(prisma.link.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        expiresAt: null,
        ga4MeasurementId: null,
      }),
    });
  });

  // Tradução: deve gerar outro código curto quando o primeiro já existir.
  it('should generate another short code when the first one already exists', async () => {
    // Mocks
    nanoidMock.mockReturnValueOnce('taken1').mockReturnValueOnce('free22');
    prisma.link.findUnique
      .mockResolvedValueOnce({ id: 'existing-link' })
      .mockResolvedValueOnce(null);
    prisma.link.create.mockResolvedValue(activeLink);

    // Chamada
    await service.create({ originalUrl: activeLink.originalUrl }, userId);

    // Resultados
    expect(prisma.link.findUnique).toHaveBeenNthCalledWith(1, {
      where: { shortCode: 'taken1' },
    });
    expect(prisma.link.findUnique).toHaveBeenNthCalledWith(2, {
      where: { shortCode: 'free22' },
    });
    expect(prisma.link.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ shortCode: 'free22' }),
    });
  });

  // Tradução: deve atualizar somente um link pertencente ao usuário.
  it('should update only a link owned by the user', async () => {
    // Mocks
    const dto = {
      originalUrl: 'https://updated.example.com',
      expiresAt: '2027-01-01T00:00:00.000Z',
    };
    prisma.link.updateMany.mockResolvedValue({ count: 1 });
    prisma.link.findFirst.mockResolvedValue({
      ...activeLink,
      _count: { linkAccesses: 2 },
    });

    // Chamada
    await service.update(linkId, dto, userId);

    // Resultados
    expect(prisma.link.updateMany).toHaveBeenCalledWith({
      where: { id: linkId, userId },
      data: {
        ...dto,
        expiresAt: new Date(dto.expiresAt),
        ga4MeasurementId: undefined,
      },
    });
  });

  // Tradução: deve rejeitar a atualização quando o link não existir ou pertencer a outro usuário.
  it('should reject an update when the link is missing or owned by another user', async () => {
    // Mocks
    prisma.link.updateMany.mockResolvedValue({ count: 0 });

    // Chamada
    const promise = service.update(
      linkId,
      { originalUrl: 'https://updated.example.com' },
      userId,
    );

    // Resultados
    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
    expect(analyticsCache.invalidateAnalyticsCache).not.toHaveBeenCalled();
    expect(prisma.link.findFirst).not.toHaveBeenCalled();
  });

  // Tradução: deve invalidar o analytics e devolver o link atualizado.
  it('should invalidate analytics and return the updated link', async () => {
    // Mocks
    const storedLink = { ...activeLink, _count: { linkAccesses: 4 } };
    prisma.link.updateMany.mockResolvedValue({ count: 1 });
    prisma.link.findFirst.mockResolvedValue(storedLink);

    // Chamada
    const result = await service.update(
      linkId,
      { originalUrl: 'https://updated.example.com' },
      userId,
    );

    // Resultados
    expect(analyticsCache.invalidateAnalyticsCache).toHaveBeenCalledWith(
      userId,
      linkId,
    );
    expect(prisma.link.findFirst).toHaveBeenCalledWith({
      where: { id: linkId, userId },
      include: { _count: { select: { linkAccesses: true } } },
    });
    expect(result).toEqual({ ...activeLink, clicks: 4 });
  });

  // Tradução: deve remover somente um link pertencente ao usuário.
  it('should remove only a link owned by the user', async () => {
    // Mocks
    prisma.link.deleteMany.mockResolvedValue({ count: 1 });

    // Chamada
    const result = await service.remove(linkId, userId);

    // Resultados
    expect(prisma.link.deleteMany).toHaveBeenCalledWith({
      where: { id: linkId, userId },
    });
    expect(result).toEqual({ message: expect.any(String) });
  });

  // Tradução: deve rejeitar a remoção quando nenhum link for apagado.
  it('should reject removal when no link is deleted', async () => {
    // Mocks
    prisma.link.deleteMany.mockResolvedValue({ count: 0 });

    // Chamada
    const promise = service.remove(linkId, userId);

    // Resultados
    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
    expect(analyticsCache.deleteAnalyticsCacheVersion).not.toHaveBeenCalled();
  });

  // Tradução: deve apagar a versão do cache depois de remover o link.
  it('should delete the cache version after removing the link', async () => {
    // Mocks
    prisma.link.deleteMany.mockResolvedValue({ count: 1 });

    // Chamada
    await service.remove(linkId, userId);

    // Resultados
    expect(analyticsCache.deleteAnalyticsCacheVersion).toHaveBeenCalledWith(
      userId,
      linkId,
    );
  });

  // Tradução: deve listar os links do usuário por data e converter a contagem de cliques.
  it("should list the user's links by date and map the click count", async () => {
    // Mocks
    prisma.link.findMany.mockResolvedValue([
      { ...activeLink, _count: { linkAccesses: 7 } },
    ]);

    // Chamada
    const result = await service.findAll(userId);

    // Resultados
    expect(prisma.link.findMany).toHaveBeenCalledWith({
      where: { userId },
      include: { _count: { select: { linkAccesses: true } } },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([
      {
        id: linkId,
        originalUrl: activeLink.originalUrl,
        shortCode: activeLink.shortCode,
        createdAt: activeLink.createdAt,
        expiresAt: null,
        ga4MeasurementId: null,
        clicks: 7,
      },
    ]);
  });

  // Tradução: deve devolver um link pertencente ao usuário com sua contagem de cliques.
  it('should return an owned link with its click count', async () => {
    // Mocks
    prisma.link.findFirst.mockResolvedValue({
      ...activeLink,
      _count: { linkAccesses: 5 },
    });

    // Chamada
    const result = await service.findOne(linkId, userId);

    // Resultados
    expect(prisma.link.findFirst).toHaveBeenCalledWith({
      where: { id: linkId, userId },
      include: { _count: { select: { linkAccesses: true } } },
    });
    expect(result).toEqual({ ...activeLink, clicks: 5 });
  });

  // Tradução: deve rejeitar a busca quando o link não existir ou pertencer a outro usuário.
  it('should reject a lookup when the link is missing or owned by another user', async () => {
    // Mocks
    prisma.link.findFirst.mockResolvedValue(null);

    // Chamada
    const promise = service.findOne(linkId, userId);

    // Resultados
    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
  });

  // Tradução: deve devolver um link ativo encontrado pelo código curto.
  it('should return an active link found by its short code', async () => {
    // Mocks
    prisma.link.findUnique.mockResolvedValue(activeLink);

    // Chamada
    const result = await service.findByShortCode('abc123');

    // Resultados
    expect(prisma.link.findUnique).toHaveBeenCalledWith({
      where: { shortCode: 'abc123' },
    });
    expect(result).toBe(activeLink);
  });

  // Tradução: deve rejeitar um código curto que não existe.
  it('should reject a short code that does not exist', async () => {
    // Mocks
    prisma.link.findUnique.mockResolvedValue(null);

    // Chamada
    const promise = service.findByShortCode('missing');

    // Resultados
    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
  });

  // Tradução: deve rejeitar um link cuja data de expiração já passou.
  it('should reject a link whose expiration date has passed', async () => {
    // Mocks
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-05T12:00:00.000Z'));
    prisma.link.findUnique.mockResolvedValue({
      ...activeLink,
      expiresAt: new Date('2026-10-05T11:59:59.000Z'),
    });

    // Chamada
    const promise = service.findByShortCode('abc123');

    // Resultados
    await expect(promise).rejects.toBeInstanceOf(GoneException);
  });

  // Tradução: deve interpretar o user-agent, obter a localização e salvar o acesso.
  it('should parse the user agent and persist the pseudonymous access', async () => {
    // Mocks
    const access = {
      ipHash: 'hashed-ip',
      country: 'Brazil',
      city: 'São Paulo',
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      referer: 'https://google.com',
      eventId: 'event-1',
    };

    // Chamada
    const result = await service.registerAccess(linkId, access);

    // Resultados
    expect(prisma.linkAccess.create).toHaveBeenCalledWith({
      data: {
        linkId,
        country: 'Brazil',
        city: 'São Paulo',
        ipHash: access.ipHash,
        eventId: access.eventId,
        referer: access.referer,
        browser: 'Chrome',
        browserVersion: '140.0.0.0',
        os: 'Windows',
        osVersion: '10',
        deviceType: 'desktop',
      },
    });
    expect(result).toBe(true);
  });

  // Tradução: deve salvar o acesso sem localização quando a consulta externa falhar.
  it('should persist the access without provider geolocation', async () => {
    // Mocks
    const access = {
      ipHash: 'hashed-ip',
      country: null,
      city: null,
      userAgent: '',
      referer: '',
      eventId: 'event-2',
    };

    // Chamada
    const result = await service.registerAccess(linkId, access);

    // Resultados
    expect(prisma.linkAccess.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ country: null, city: null }),
    });
    expect(result).toBe(true);
  });

  // Tradução: deve devolver falso quando o event ID já tiver sido processado.
  it('should return false when the event ID has already been processed', async () => {
    // Mocks
    const duplicateError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: 'test' },
    );
    prisma.linkAccess.create.mockRejectedValue(duplicateError);
    const access = {
      ipHash: null,
      country: null,
      city: null,
      userAgent: '',
      referer: '',
      eventId: 'event-duplicate',
    };

    // Chamada
    const result = await service.registerAccess(linkId, access);

    // Resultados
    expect(result).toBe(false);
  });

  // Tradução: deve propagar erros inesperados ocorridos ao salvar o acesso.
  it('should rethrow unexpected errors raised while persisting the access', async () => {
    // Mocks
    const error = new Error('database unavailable');
    prisma.linkAccess.create.mockRejectedValue(error);
    const access = {
      ipHash: null,
      country: null,
      city: null,
      userAgent: '',
      referer: '',
      eventId: 'event-3',
    };

    // Chamada
    const promise = service.registerAccess(linkId, access);

    // Resultados
    await expect(promise).rejects.toBe(error);
  });
});
