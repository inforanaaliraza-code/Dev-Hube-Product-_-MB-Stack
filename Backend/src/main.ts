import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const bodyLimit = config.get<string>('http.bodyLimit') ?? '2mb';
  app.useBodyParser('json', { limit: bodyLimit });
  app.useBodyParser('urlencoded', { limit: bodyLimit, extended: true });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const origin = config.get<string>('cors.origin');
  app.enableCors({
    origin: origin ? origin.split(',').map((o) => o.trim()) : true,
    credentials: true,
  });

  const port = config.get<number>('port') ?? 4000;
  await app.listen(port);
}

bootstrap();
