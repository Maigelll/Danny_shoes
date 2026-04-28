import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Global prefix + versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('DannyShoes API')
      .setDescription('Sistema SaaS de Gestión de Calzado — API REST')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticación y sesiones')
      .addTag('inventory', 'Gestión de inventario')
      .addTag('orders', 'Pedidos inter-tienda')
      .addTag('warehouse', 'Operaciones de bodega')
      .addTag('print', 'Cola de impresión térmica')
      .addTag('sales', 'Ventas y POS')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    console.log(`📚 Swagger disponible en http://localhost:${process.env.API_PORT ?? 4000}/docs`);
  }

  const port = process.env.API_PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 API corriendo en http://localhost:${port}/api/v1`);
}

bootstrap();
