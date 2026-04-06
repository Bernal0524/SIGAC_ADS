import * as dotenv from 'dotenv';
// 1. Cargar variables de entorno antes que cualquier otra cosa
dotenv.config(); 

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('SIGAC-Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 2. Prefijo Global de la API
  // IMPORTANTE: Esto hace que Axios deba apuntar a http://localhost:3000/api
  app.setGlobalPrefix('api');

  // 3. Configuración de CORS (Crucial para que el Front no rebote)
  app.enableCors({
    origin: true, // En desarrollo, esto permite cualquier origen. Más seguro para pruebas locales.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // 4. Validaciones automáticas de DTOs
  app.useGlobalPipes(new ValidationPipe({
    // Limpia los datos de entrada dejando solo lo definido en el DTO
    whitelist: true, 
    
    // Si el frontend envía algo extra, no explota, solo lo ignora (mejor para desarrollo)
    forbidNonWhitelisted: false, 
    
    // Convierte tipos automáticamente (Ej: el "start" y "end" de las queries a Date/String)
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // 5. Filtro global de errores (Estandariza los 400, 401, 500)
  app.useGlobalFilters(new AllExceptionsFilter());

  // 6. Interceptor global de transformación
  // OJO: Si este interceptor mete todo en { data: ... }, 
  // asegúrate que el Front lea 'response.data.data'
  app.useGlobalInterceptors(new TransformInterceptor());

  // 7. Definición del puerto
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  
  console.log('\n--------------------------------------------------');
  logger.log(`🚀 SIGAC SISTEMA DE ORQUESTACIÓN OPERATIVO`);
  logger.log(`📡 BACKEND ENDPOINT: http://localhost:${port}/api`);
  logger.log(`🛠️ MODO: ${process.env.NODE_ENV || 'development'}`);
  console.log('--------------------------------------------------\n');
}

bootstrap();