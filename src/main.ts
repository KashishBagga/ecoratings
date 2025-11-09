import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('EcoRatings API')
    .setDescription('Scope 2 GHG Emissions Tracking Service')
    .setVersion('1.0')
    .addTag('organizations', 'Organization management')
    .addTag('facilities', 'Facility management')
    .addTag('electricity-usage', 'Electricity usage data upload and management')
    .addTag('emission-factors', 'Grid emission factors management')
    .addTag('emissions', 'Emissions calculations and reports')
    .addTag('health', 'Health check and metrics')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();

