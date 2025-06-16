import 'reflect-metadata';
// Register tsconfig paths for runtime path resolution
require('tsconfig-paths/register');

// Interface definitions
interface VercelRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[]>;
  body?: unknown;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string): void;
  json(object: unknown): void;
  end(): void;
}

let cachedApp: unknown;

async function createNestApp() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    // Use require for module loading to avoid TS compilation issues
    const { NestFactory } = require('@nestjs/core');
    const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
    
    // Load compiled modules from dist
    const AppModule = require('../dist/app.module').AppModule;
    const ValidationPipe = require('../dist/common/pipes/validation.pipe').ValidationPipe;
    const ResponseTransformInterceptor = require('../dist/common/interceptors/response-transform.interceptor').ResponseTransformInterceptor;

    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Set global prefix
    app.setGlobalPrefix('api');

    // Set up global pipes and interceptors
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new ResponseTransformInterceptor());

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('API de Ecommerce')
      .setDescription('API completa para la plataforma de ecommerce')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Introduce tu token JWT',
        in: 'header',
      }, 'JWT-auth')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      customSiteTitle: 'API Ecommerce Documentation',
    });

    await app.init();
    cachedApp = app;
    return app;
  } catch (error) {
    console.error('Error creating NestJS app:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(200).end();
      return;
    }

    const app = await createNestApp();
    const server = (app as any).getHttpAdapter().getInstance();
    
    return server(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(500).json({
      message: 'Internal Server Error',
      error: errorMessage,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
    });
  }
}
