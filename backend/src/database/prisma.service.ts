import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // En la v5, esto funciona perfecto y TypeScript NO se queja
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('---');
      console.log('🚀 [SIGAC]: Backend ONLINE (v5.22.0 Estable)');
      console.log('---');
    } catch (error: any) {
      console.error('❌ Error de conexión:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}