import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomInt } from 'crypto';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { User, UserDocument } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<{ code: number }> {
    const { email, password, ...otherData } = createUserDto;

    const verificationCode = randomInt(100000, 1000000);
    const existingUser: User = await this.userModel.findOne({
      'email.address': email,
    });

    if (existingUser) {
      throw new BadRequestException('User with that email already exists');
    }

    const data = {
      email: {
        address: email,
        verified: false,
        verificationCode,
      },
      ...otherData,
    };

    const userModel = new this.userModel(data);
    userModel.setPassword(password);
    await userModel.save();
    return { code: verificationCode };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({}, { password: 0 });
  }

  async findOne(id: ObjectId): Promise<User> {
    return this.userModel.findById(id, { password: 0 });
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ 'email.address': email }, { password: 0 });
  }

  async verifyEmail(
    verifyUserDto: VerifyUserDto,
  ): Promise<{ success: boolean }> {
    const { email, verificationCode } = verifyUserDto;
    const user: User = await this.userModel.findOne({ 'email.address': email });
    if (!user) {
      throw new BadRequestException('User with that email does not exist');
    }

    if (user.email.verified) {
      throw new BadRequestException('Email is already verified');
    }
    if (user.email.verificationCode !== verificationCode) {
      throw new BadRequestException('Verification code is incorrect');
    }
    user.email.verified = true;
    user.save();
    return { success: true };
  }

  async validateUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ 'email.address': email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.email.verified) {
      throw new BadRequestException('Email is not verified');
    }

    if (user.validPassword(password)) {
      const { password: _, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    }

    return null;
  }
}
