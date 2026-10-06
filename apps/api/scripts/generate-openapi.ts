import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { createOpenApiDocument } from '../src/openapi';

async function generateOpenApi(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: false,
    preview: true,
  });

  try {
    const document = createOpenApiDocument(app);
    const outputPath = resolve(__dirname, '..', 'openapi.json');

    await writeFile(
      outputPath,
      `${JSON.stringify(document, null, 2)}\n`,
      'utf8',
    );
  } finally {
    await app.close();
  }
}

generateOpenApi().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
