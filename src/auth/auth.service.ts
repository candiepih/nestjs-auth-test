import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { LoginUserDto } from './../users/dto/login-user.dto';
import { VerifyUserDto } from './../users/dto/verify-user.dto';
import { UsersService } from './../users/users.service';

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

  async findUserByEmail(email: string): Promise<any> {
    return this.usersService.findOneByEmail(email);
  }
}
