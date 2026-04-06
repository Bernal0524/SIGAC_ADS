import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from './modules/auth/auth.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { GroupsModule } from './modules/groups/groups.module'; // ¡AÑADIDO!
import { DatabaseModule } from './database/database.module';

import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule, 
    PassportModule,
    
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback_secret_key_123', 
      signOptions: { expiresIn: '1d' },
    }),

    AuthModule,
    ActivitiesModule,
    AvailabilityModule,
    GroupsModule, // ¡IMPORTANTE: Registramos el módulo de grupos!
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}