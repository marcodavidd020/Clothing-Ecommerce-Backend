import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app/config.service';
import { ValidationPipe as CustomValidationPipe } from './common/pipes/validation.pipe';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para todos los orígenes
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const appConfig = app.get(AppConfigService);

  const port = appConfig.port;
  const globalPrefix = appConfig.apiPrefix;

  app.setGlobalPrefix(globalPrefix);

  // Usar nuestro ValidationPipe personalizado en lugar del estándar
  app.useGlobalPipes(new CustomValidationPipe());

  // Registrar el interceptor de transformación de respuestas
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Ecommerce')
    .setDescription(
      'API completa para la plataforma de ecommerce. Esta API permite gestionar usuarios, productos, categorías, carrito de compras, pedidos y pagos. El sistema incluye autenticación JWT y gestión de roles y permisos.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Introduce tu token JWT',
        in: 'header',
      },
      'JWT-auth', // Este nombre se usará para referenciar este esquema de seguridad
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);

  console.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}
bootstrap();
