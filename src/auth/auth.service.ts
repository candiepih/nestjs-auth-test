import { ObjectId } from 'mongoose';
import { IUser } from './../users/interfaces/user.interface';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { LoginUserDto } from './../users/dto/login-user.dto';
import { VerifyUserDto } from './../users/dto/verify-user.dto';
import { UsersService } from './../users/users.service';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: CreateUserDto): Promise<{ code: number }> {
    return this.usersService.create(data);
  }

  async verifyEmail(data: VerifyUserDto): Promise<{ success: boolean }> {
    return this.usersService.verifyEmail(data);
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    const user = await this.usersService.validateUser(loginUserDto);

    if (user) {
      return { token: this.jwtService.sign(user) };
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
      email: userWithoutPsw.email.address,
      _id: userWithoutPsw._id,
      isTwoFactorEnabled: !!userWithoutPsw.isTwoFactorEnabled,
      isTwoFactorAuthenticated: true,
    };

    return {
      email: payload.email,
      access_token: this.jwtService.sign(payload),
    };
  }
}
