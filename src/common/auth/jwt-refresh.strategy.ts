import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

export class jwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie.replace('myRefreshKey=', '');
        return refreshToken;
      },
      secretOrKey: 'myRefreshKey',
    });
  }
  validate(payload) {
    console.log(payload);
    return {
      email: payload.email,
    };
  }
}
