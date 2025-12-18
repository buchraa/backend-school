import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SUPER_SECRET_TEST', // process.env.JWT_SECRET,
    });
  }

async validate(payload: any) {
    
  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    parentId: payload.parentId ?? null,
    teacherId: payload.teacherId ?? null,
    staffId: payload.staffId ?? null,
  };
}

}

/** */
