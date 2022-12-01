import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUser } from 'src/users/interfaces/user.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class Jwt2FAStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET,
    });
  }

  async validate(payload: Partial<IUser>) {
    const user = await this.authService.findUserByEmail(payload.email.address);

    if (user) {
      return user;
    }
  }
}
