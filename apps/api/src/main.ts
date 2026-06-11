import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

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

	const config = new DocumentBuilder()
		.setTitle("Link Engine")
		.setDescription("API de encurtador de links")
		.setVersion("1.0")
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup("swagger", app, document);

	const configService = new ConfigService();
	const port = configService.get<string>("PORT") ?? 3000;

	await app.listen(port);
}

bootstrap();
