import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Usamos la clave definida para 2026
      secretOrKey: process.env.JWT_SECRET || 'SIGAC_SUPER_SECRET_KEY_2026',
    });
  }

  async validate(payload: any) {
    // Retornamos 'id' para mantener consistencia con el esquema de Prisma
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}