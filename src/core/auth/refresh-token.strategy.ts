// src/core/auth/refresh-token.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";

function cookieExtractor(req: Request): string | null {
  return req?.cookies?.refreshToken ?? null;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh"
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: config.get<string>("REFRESH_SECRET"),
      ignoreExpiration: false, // let JWT lib enforce exp on refresh token
      passReqToCallback: true,
    });
  }

  // whatever you return here becomes req.user
  validate(req: Request, payload: any) {
    const refreshToken = cookieExtractor(req);
    return { ...payload, refreshToken };
  }
}
