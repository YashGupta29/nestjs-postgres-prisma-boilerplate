import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthenticateDto, LoginDto, SignupDto } from 'auth/dto';
import { UpdateDraftUserDto, UpdateUserDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async authenticate(body: AuthenticateDto) {
    let user: User = null;
    if (body.email) {
      user = await this.getUserByEmail(body.email);
    } else {
      user = await this.getUserByMobile(body.mobileNumber);
    }
    let mode = 'signup';
    if (user && !user.draft) mode = 'login';

    return { mode };
  }

  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createDraftUser(data: LoginDto) {
    // Check is draft user is already present with the same credentials
    let user: User = null;
    if (data.email) user = await this.getUserByEmail(data.email);
    else user = await this.getUserByMobile(data.mobileNumber);

    // If user already present no need to create again
    if (user) return this.serializeUser(user);

    const id = Math.random().toString(32).slice(2);
    console.log('User Id ->', id);

    let userData = {};
    if (data.mobileNumber) {
      const [countryCode, mobileNumber] = data.mobileNumber.split('-');
      userData = {
        ...data,
        countryCode: countryCode.replace('+', '').trim(),
        mobileNumber: mobileNumber.trim(),
      };
    }

    user = await this.prisma.user.create({
      data: {
        ...userData,
        id: id,
        email: data.email ? data.email.trim() : `draft.user.${id}@gmail.com`,
        firstName: 'Draft',
        lastName: 'User',
        emailVerified: data.email ? true : false,
        mobileVerified: data.mobileNumber ? true : false,
        draft: true,
      },
    });
    return this.serializeUser(user);
  }

  async createUser(data: SignupDto) {
    // Check is draft user is already present with the same credentials
    let user: User = null;
    if (data.email) user = await this.getUserByEmail(data.email);
    else user = await this.getUserByMobile(data.mobileNumber);

    // If user already present no need to create again
    if (user && !user.draft) return this.serializeUser(user);
    else if (user && user.draft) this.deleteUserById(user.id);

    const id = Math.random().toString(32).slice(2);
    console.log('User Id ->', id);

    let userData = {};
    if (data.mobileNumber) {
      const [countryCode, mobileNumber] = data.mobileNumber.split('-');
      userData = {
        ...data,
        countryCode: countryCode.replace('+', '').trim(),
        mobileNumber: mobileNumber.trim(),
      };
    }

    user = await this.prisma.user.create({
      data: {
        ...userData,
        id: id,
        email: data.email.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        emailVerified: data.email ? true : false,
        mobileVerified: data.mobileNumber ? true : false,
        draft: false,
      },
    });
    return this.serializeUser(user);
  }

  async updateDraftUser(data: UpdateDraftUserDto) {
    let user: User = null;
    let userData = {};
    if (data.mobileNumber) {
      const [countryCode, mobileNumber] = data.mobileNumber.split('-');
      user = await this.prisma.user.findFirst({
        where: {
          mobileNumber: mobileNumber,
          draft: true,
        },
      });
      userData = {
        ...data,
        countryCode: countryCode.replace('+', '').trim(),
        mobileNumber: mobileNumber.trim(),
      };
    } else {
      user = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          draft: true,
        },
      });
      userData = { ...data };
    }

    if (!user) throw new BadRequestException();

    user = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: { ...userData, draft: false },
    });

    return this.serializeUser(user);
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    let userData = {};
    if (data.mobileNumber) {
      const [countryCode, mobileNumber] = data.mobileNumber.split('-');
      userData = {
        ...data,
        countryCode: countryCode.replace('+', '').trim(),
        mobileNumber: mobileNumber.trim(),
        mobileVerified: false,
      };
    } else userData = { ...data };

    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: { ...userData },
    });
    if (!user) return null;
    return this.serializeUser(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
  }

  getAllUsers() {}

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) return null;
    return this.serializeUser(user);
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
    if (!user) return null;
    return this.serializeUser(user);
  }

  async getUserByMobile(mobileNumber: string) {
    const [_, number] = mobileNumber.split('-');
    const user = await this.prisma.user.findUnique({
      where: {
        mobileNumber: number.trim(),
      },
    });
    if (!user) return null;
    return this.serializeUser(user);
  }

  deleteAllUsers() {}

  async deleteUserById(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  deleteUserByEmail() {}

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        refreshToken: refreshToken,
      },
    });

    if (!user) throw new UnauthorizedException();
  }

  async verifyUser(userId: string, data: AuthenticateDto) {
    if (data.mobileNumber) {
      const [countryCode, mobile] = data.mobileNumber.split('-');
      data.mobileNumber = mobile.trim();
      data['countryCode'] = countryCode.replace('+', '').trim();
    } else data.email = data.email.trim();

    const user = await this.prisma.user.findFirst({
      where: {
        ...data,
        id: userId,
      },
    });

    if (!user) throw new BadRequestException();
  }

  serializeUser(user: User) {
    //@TODO - Implement Serializer
    delete user.refreshToken;
    delete user.createdAt;
    delete user.updatedAt;

    return user;
  }
}
