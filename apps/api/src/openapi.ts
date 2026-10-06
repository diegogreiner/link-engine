import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Link Engine API')
    .setDescription(
      'API para criação de links curtos, redirecionamento e consulta de analytics.',
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Desenvolvimento local')
    .addTag('Auth', 'Cadastro, autenticação e sessões')
    .addTag('Links', 'Criação e gestão de links curtos')
    .addTag('Analytics', 'Métricas dos links do usuário')
    .addTag('Redirect', 'Redirecionamento público de links curtos')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token obtido em /auth/login',
      },
      'bearer',
    )
    .build();

  return SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
}

export function setupSwagger(app: INestApplication): void {
  SwaggerModule.setup('swagger', app, createOpenApiDocument(app), {
    customSiteTitle: 'Link Engine API',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
