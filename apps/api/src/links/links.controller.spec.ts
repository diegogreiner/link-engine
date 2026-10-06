import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('nanoid', () => ({ nanoid: jest.fn() }));

import { LinksController } from './links.controller';
import type { LinksService } from './links.service';

describe('LinksController', () => {
  let linksService: {
    create: jest.Mock<LinksService['create']>;
    update: jest.Mock<LinksService['update']>;
    remove: jest.Mock<LinksService['remove']>;
    findAll: jest.Mock<LinksService['findAll']>;
    findOne: jest.Mock<LinksService['findOne']>;
  };
  let controller: LinksController;
  let request: Parameters<LinksController['findAll']>[0];

  beforeEach(() => {
    linksService = {
      create: jest.fn<LinksService['create']>(),
      update: jest.fn<LinksService['update']>(),
      remove: jest.fn<LinksService['remove']>(),
      findAll: jest.fn<LinksService['findAll']>(),
      findOne: jest.fn<LinksService['findOne']>(),
    };
    request = {
      user: { sub: 'user-1', email: 'ana@example.com' },
    } as Parameters<LinksController['findAll']>[0];
    controller = new LinksController(linksService as unknown as LinksService);
  });

  // Tradução: deve criar um link para o usuário autenticado.
  it('should create a link for the authenticated user', async () => {
    // Mocks
    const dto = { originalUrl: 'https://example.com' };
    const expectedResult = { id: 'link-1', ...dto, shortCode: 'abc123' };
    linksService.create.mockResolvedValue(expectedResult as never);

    // Chamada
    const result = await controller.create(dto, request);

    // Resultados
    expect(linksService.create).toHaveBeenCalledWith(dto, 'user-1');
    expect(result).toEqual(expectedResult);
  });

  // Tradução: deve atualizar o link informado para o usuário autenticado.
  it('should update the requested link for the authenticated user', async () => {
    // Mocks
    const dto = { originalUrl: 'https://updated.example.com' };
    const expectedResult = { id: 'link-1', ...dto, clicks: 0 };
    linksService.update.mockResolvedValue(expectedResult as never);

    // Chamada
    const result = await controller.update('link-1', dto, request);

    // Resultados
    expect(linksService.update).toHaveBeenCalledWith('link-1', dto, 'user-1');
    expect(result).toEqual(expectedResult);
  });

  // Tradução: deve remover o link informado para o usuário autenticado.
  it('should remove the requested link for the authenticated user', async () => {
    // Mocks
    const expectedResult = { message: 'Link excluído com sucesso' };
    linksService.remove.mockResolvedValue(expectedResult);

    // Chamada
    const result = await controller.remove('link-1', request);

    // Resultados
    expect(linksService.remove).toHaveBeenCalledWith('link-1', 'user-1');
    expect(result).toEqual(expectedResult);
  });

  // Tradução: deve listar os links do usuário autenticado.
  it('should list links for the authenticated user', async () => {
    // Mocks
    const expectedResult = [{ id: 'link-1', clicks: 3 }];
    linksService.findAll.mockResolvedValue(expectedResult as never);

    // Chamada
    const result = await controller.findAll(request);

    // Resultados
    expect(linksService.findAll).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(expectedResult);
  });

  // Tradução: deve buscar o link informado para o usuário autenticado.
  it('should find the requested link for the authenticated user', async () => {
    // Mocks
    const expectedResult = { id: 'link-1', clicks: 3 };
    linksService.findOne.mockResolvedValue(expectedResult as never);

    // Chamada
    const result = await controller.findOne('link-1', request);

    // Resultados
    expect(linksService.findOne).toHaveBeenCalledWith('link-1', 'user-1');
    expect(result).toEqual(expectedResult);
  });
});
