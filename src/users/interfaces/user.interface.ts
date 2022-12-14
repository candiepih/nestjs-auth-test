import { ObjectId } from 'mongoose';

export class IEmail {
  verified?: boolean;
  address: string;
  verificationCode?: number;
}

export class IPhone {
  verified: boolean;
  number: number;
  verificationCode: number;
}

export class IPassword {
  hash: string;
  salt: string;
}

export class IName {
  firstName: string;
  lastName: string;
}

export class IUser {
  _id: ObjectId;
  name: IName;
  email: IEmail;
  phone: IPhone;
  isTwoFactorEnabled: boolean;
  twoFactorAuthenticationSecret: string;
}
