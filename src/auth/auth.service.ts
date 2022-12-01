import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongoose';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { LoginUserDto } from './../users/dto/login-user.dto';
import { VerifyUserDto } from './../users/dto/verify-user.dto';
import { IUser } from './../users/interfaces/user.interface';
import { UsersService } from './../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: CreateUserDto): Promise<{ code: number }> {
    return this.usersService.create(data);
  }

  async generateJwtToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('SECRET'),
    });
  }

  async verifyEmail(data: VerifyUserDto): Promise<{ success: boolean }> {
    return this.usersService.verifyEmail(data);
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    const user = await this.usersService.validateUser(loginUserDto);

    if (user) {
      const token = await this.generateJwtToken(user);
      return { token };
    }
    return null;
  }

  async findUserByEmail(email: string): Promise<Partial<IUser>> {
    return this.usersService.findOneByEmail(email);
  }

  async generateTwoFactorAuthenticationSecret(user: Partial<IUser>) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      user.email.address,
      process.env.AUTH_APP_NAME,
      secret,
    );

    await this.usersService.setTwoFactorAuthenticationSecret(secret, user._id);

    return {
      secret,
      otpauthUrl,
    };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: Partial<IUser>,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }

  turnOnTwoFactorAuthentication(user_id: ObjectId) {
    return this.usersService.turnOnTwoFactorAuthentication(user_id);
  }

  async loginWith2fa(userWithoutPsw: Partial<IUser>) {
    const payload = {
      ...userWithoutPsw,
    };
    const token = await this.generateJwtToken(payload['_doc']);
    return {
      email: userWithoutPsw.email.address,
      token,
    };
  }
}
