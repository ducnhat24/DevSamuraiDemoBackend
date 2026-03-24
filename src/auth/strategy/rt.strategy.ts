import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { Injectable } from '@nestjs/common';

type RefreshJwtPayload = {
  sub: string;
  email: string;
};

type RefreshUser = RefreshJwtPayload & {
  refreshToken: string;
};

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: RefreshJwtPayload): RefreshUser {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();
    return {
      ...payload,
      refreshToken: refreshToken ?? '',
    };
  }
}
