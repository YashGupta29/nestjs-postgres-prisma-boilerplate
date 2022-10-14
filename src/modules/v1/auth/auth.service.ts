import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { Auth, google } from 'googleapis';
import { firstValueFrom } from 'rxjs';
import { TokenService } from 'token/token.service';
import { UserService } from 'user/user.service';
import { LoginDto, SignupDto } from './dto';

@Injectable()
export class AuthService {
  oAuthClient: Auth.OAuth2Client;
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.oAuthClient = new google.auth.OAuth2(
      configService.get('GOOGLE_CLIENT_ID'),
      configService.get('GOOGLE_CLIENT_SECRET'),
    );
  }
  async login(data: LoginDto) {
    let user: User = null;
    const { email, mobileNumber } = data;
    if (email) {
      user = await this.userService.getUserByEmail(email.trim());
      // If user is logging using email code verify email
      if (!user.emailVerified)
        user = await this.userService.updateUser(user.id, {
          emailVerified: true,
        });
    } else {
      user = await this.userService.getUserByMobile(mobileNumber);
      // If user is logging using mobile code verify mobile
      if (!user.mobileVerified)
        user = await this.userService.updateUser(user.id, {
          mobileVerified: true,
        });
    }

    const accessToken = await this.tokenService.getAccessToken(user.id);
    const refreshToken = await this.tokenService.getRefreshToken(user.id);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async draft(data: LoginDto) {
    await this.userService.createDraftUser(data);
  }

  async signup(data: SignupDto) {
    const user = await this.userService.updateDraftUser(data);

    const accessToken = await this.tokenService.getAccessToken(user.id);
    const refreshToken = await this.tokenService.getRefreshToken(user.id);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async googleLogin(token: string) {
    let userData = {};

    this.oAuthClient.setCredentials({
      access_token: token,
    });
    const userInfoClient = google.oauth2('v2').userinfo;

    const userInfo = await userInfoClient.get({
      auth: this.oAuthClient,
    });

    userData = {
      firstName: userInfo.data.given_name,
      lastName: userInfo.data.family_name,
      email: userInfo.data.email,
    };

    const user = await this.userService.createUser(userData as SignupDto);

    const accessToken = await this.tokenService.getAccessToken(user.id);
    const refreshToken = await this.tokenService.getRefreshToken(user.id);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async facebookLogin(token: string) {
    let userData = {};

    const {
      data: { id },
    } = await firstValueFrom(
      this.httpService.get(
        `${this.configService.get(
          'FACEBOOK_GRAPH_API',
        )}/me?access_token=${token}`,
      ),
    );

    const userInfo = await firstValueFrom(
      this.httpService.get(
        `${this.configService.get(
          'FACEBOOK_GRAPH_API',
        )}/${id}?fields=first_name,last_name,email&access_token=${token}`,
      ),
    );

    userData = {
      firstName: userInfo.data.first_name,
      lastName: userInfo.data.last_name,
      email: userInfo.data.email,
    };

    const user = await this.userService.createUser(userData as SignupDto);

    const accessToken = await this.tokenService.getAccessToken(user.id);
    const refreshToken = await this.tokenService.getRefreshToken(user.id);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}
