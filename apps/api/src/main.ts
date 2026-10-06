import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupSwagger } from "./openapi";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	app.enableCors({
		origin: true,
		credentials: true,
	});

	setupSwagger(app);

	const configService = new ConfigService();
	const port = configService.get<string>("PORT") ?? 3000;

	await app.listen(port);
}

bootstrap();
