import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração de CORS
  const frontendUrl = process.env.FRONTEND_URL; // Fallback para testes
  if (!frontendUrl) {
    throw new Error('FRONTEND_URL não está configurado no .env');
  }

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true, // Suporta credentials: 'include'
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
  });

  // Middleware para preservar o raw body para webhooks do Stripe
  app.use('/stripe/webhook', raw({ type: 'application/json' }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Configuração do Swagger API
  const config = new DocumentBuilder()
    .setTitle('CleanUp API')
    .setDescription('API documentation for CleanUp application')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme();
  const options = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
  };
  SwaggerModule.setup('api-docs', app, document, options);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Aplicação rodando em: http://localhost:${port}`);
}
bootstrap();