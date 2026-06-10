import { ValidationPipe } from "@nestjs/common";
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
		origin: "http://localhost:3001",
	});

	const config = new DocumentBuilder()
		.setTitle("Link Engine")
		.setDescription("API de encurtador de links")
		.setVersion("1.0")
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup("swagger", app, document);

	await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
