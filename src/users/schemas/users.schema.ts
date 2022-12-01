import { IName } from './../interfaces/user.interface';
import { HydratedDocument } from 'mongoose';
import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import { IEmail, IPhone, IPassword } from '../interfaces/user.interface';
import { randomBytes, pbkdf2Sync } from 'crypto';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop(
    raw({
      address: { type: String },
      verified: { type: Boolean },
      verificationCode: { type: Number },
    }),
  )
  email: IEmail;

  @Prop(
    raw({
      hash: { type: String },
      salt: { type: String },
    }),
  )
  password: IPassword;

  @Prop(
    raw({
      firstName: { type: String },
      lastName: { type: String },
    }),
  )
  name: IName;

  @Prop(
    raw({
      number: { type: Number },
      verified: { type: Boolean },
      verificationCode: { type: Number },
    }),
  )
  phone: IPhone;

  @Prop({ required: true, default: true })
  acceptedTerms: boolean;

  @Prop({ required: true, default: false })
  subscribedToNewsLetters: boolean;

  @Prop({ required: true, default: false })
  rememberMe: boolean;

  @Prop({ required: true, default: false })
  isTwoFactorEnabled: boolean;

  @Prop()
  twoFactorAuthenticationSecret: string;

  setPassword: (password: string) => void;
  validPassword: (password: string) => boolean;
  save: () => void;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.setPassword = function (password: string) {
  // Creating a unique salt for a particular user
  this.password.salt = randomBytes(16).toString('hex');
  this.password.hash = pbkdf2Sync(
    password,
    this.password.salt,
    1000,
    64,
    `sha512`,
  ).toString(`hex`);
};

UserSchema.methods.validPassword = function (password: string) {
  const hash = pbkdf2Sync(
    password,
    this.password.salt,
    1000,
    64,
    `sha512`,
  ).toString(`hex`);
  return this.password.hash === hash;
};
