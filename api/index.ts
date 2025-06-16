import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Import modules from the parent directory
import { AppModule } from '../dist/app.module';
import { ValidationPipe as CustomValidationPipe } from '../dist/common/pipes/validation.pipe';
import { ResponseTransformInterceptor } from '../dist/common/interceptors/response-transform.interceptor';

let cachedApp: any;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    const app = await NestFactory.create(AppModule);

    // Habilitar CORS para todos los orígenes
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Configurar prefijo global
    app.setGlobalPrefix('api');

    // Usar ValidationPipe personalizado
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
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      customSiteTitle: 'API Ecommerce Documentation',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    await app.init();
    cachedApp = app;
    return app;
  } catch (error) {
    console.error('Error during bootstrap:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(200).end();
      return;
    }

    const app = await bootstrap();
    const server = app.getHttpAdapter().getInstance();
    
    return server(req, res);
  } catch (error) {
    console.error('Error in Vercel handler:', error);
    res.status(500).json({ 
      message: 'Internal Server Error',
      error: error.message,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    });
  }
} 