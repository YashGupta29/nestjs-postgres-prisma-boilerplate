import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import * as argon from 'argon2';
import { TokenService } from 'token/token.service';
import { Request, Response } from 'express';
import { UserService } from 'user/user.service';
import { AuthService } from './auth.service';
import { AuthenticateDto, SignupDto, VerifyDto } from './dto';
import { MailService } from 'common/mail/mail.service';
import { SmsService } from 'common/sms/sms.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  @Post()
  async authenticate(
    @Body() data: AuthenticateDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Get Mode and Otp
    const { mode } = await this.userService.authenticate(data);
    const otp = this.userService.generateOtp();

    // Send Otp to Mail or Mobile
    if (data.email) {
      //@TODO - Send Otp to Mail
      await this.mailService.sendEmail(
        data.email,
        'd-c92bafec2b224aba8724cd11c0e7e647',
        { code: otp },
      );
    } else {
      //@TODO - Send Otp to Mobile
      await this.smsService.sendSms(
        data.mobileNumber.split('-').join('').trim(),
        `Verification Code: ${otp}`,
      );
    }

    // Setting the OTP and Provider in HTTP Only Cookie
    const hash = await argon.hash(otp);
    res.cookie('otp', hash, {
      expires: new Date(new Date().getTime() + 900000),
      httpOnly: true,
      domain: 'localhost',
    });
    const provider = data.email ? 'email' : 'mobile';
    res.cookie('provider', provider, {
      expires: new Date(new Date().getTime() + 900000),
      httpOnly: true,
      domain: 'localhost',
    });

    console.log('OTP -> ', otp);
    return { mode };
  }

  @Post('verify')
  async verify(
    @Req() req: Request,
    @Body() data: VerifyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Vaidate OTP
    const hash = req.cookies['otp'];
    const provider = req.cookies['provider'];
    const isValid =
      (data.email && provider === 'email') ||
      (data.mobileNumber && provider === 'mobile');
    if (!hash || !isValid)
      throw new UnauthorizedException('Invalid Provider or No Otp');
    const isCorrect = await argon.verify(hash, data.code);
    if (!isCorrect) throw new BadRequestException('Invalid OTP');

    res.cookie('otp', hash, { expires: new Date(Date.now()) });

    const { mode } = await this.userService.authenticate(data);

    if (mode === 'login') {
      const { accessToken, refreshToken } = await this.authService.login(data);

      // Setting the Refresh Token in HTTP Only Cookie
      res.cookie('refreshToken', refreshToken, {
        expires: new Date(
          new Date().getTime() +
            parseInt(this.configService.get('REFRESH_TOKEN_COOKIE_EXPIRY')) ||
            1296000000, // 15 Days,
        ),
        httpOnly: true,
        domain: 'localhost',
      });

      return { accessToken };
    }
    delete data.code;
    await this.authService.draft(data);
  }

  @Post('signup')
  async signup(
    @Body() data: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.signup(data);

    // Setting the Refresh Token in HTTP Only Cookie
    res.cookie('refreshToken', refreshToken, {
      expires: new Date(
        new Date().getTime() +
          parseInt(this.configService.get('REFRESH_TOKEN_COOKIE_EXPIRY')) ||
          1296000000, // 15 Days,
      ),
      httpOnly: true,
      domain: 'localhost',
    });

    return { accessToken };
  }

  @Post('google')
  async googleLogin(@Body() data, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.googleLogin(
      data.token,
    );

    // Setting the Refresh Token in HTTP Only Cookie
    res.cookie('refreshToken', refreshToken, {
      expires: new Date(
        new Date().getTime() +
          parseInt(this.configService.get('REFRESH_TOKEN_COOKIE_EXPIRY')) ||
          1296000000, // 15 Days,
      ),
      httpOnly: true,
      domain: 'localhost',
    });

    return { accessToken };
  }

  @Post('facebook')
  async facebookLogin(@Body() data, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.facebookLogin(
      data.token,
    );

    // Setting the Refresh Token in HTTP Only Cookie
    res.cookie('refreshToken', refreshToken, {
      expires: new Date(
        new Date().getTime() +
          parseInt(this.configService.get('REFRESH_TOKEN_COOKIE_EXPIRY')) ||
          1296000000, // 15 Days,
      ),
      httpOnly: true,
      domain: 'localhost',
    });

    return { accessToken };
  }

  @UseGuards(AuthGuard('accessToken'))
  @Post('send-verification-otp')
  async sendVerificationOtp(
    @Req() req: Request,
    @Body() data: AuthenticateDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const otp = this.userService.generateOtp();
    await this.userService.verifyUser(req.user as string, data);
    // Send Otp to Mail or Mobile
    if (data.email) {
      //@TODO - Send Otp to Mail
    } else {
      //@TODO - Send Otp to Mobile
    }

    // Setting the OTP and Provider in HTTP Only Cookie
    const hash = await argon.hash(otp.toString());
    res.cookie('otp', hash, {
      expires: new Date(new Date().getTime() + 900000),
      sameSite: 'strict',
      httpOnly: true,
      domain: 'localhost',
    });
    res.cookie('provider', data.email ? 'email' : 'mobile', {
      expires: new Date(new Date().getTime() + 900000),
      sameSite: 'strict',
      httpOnly: true,
      domain: 'localhost',
    });

    console.log('OTP -> ', otp);
  }

  @UseGuards(AuthGuard('accessToken'))
  @Post('verify-verification-otp')
  async verifyVerificationOtp(
    @Req() req: Request,
    @Body() data: VerifyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Vaidate OTP
    const hash = req.cookies['otp'];
    const provider = req.cookies['provider'];
    const isValid =
      (data.email && provider === 'email') ||
      (data.mobileNumber && provider === 'mobile');
    if (!hash || !isValid) throw new UnauthorizedException();
    const isCorrect = await argon.verify(hash, data.code.toString());
    if (!isCorrect) throw new BadRequestException('Invalid OTP');

    res.cookie('otp', hash, { expires: new Date(Date.now()) });

    let userData = {};
    if (data.email) userData = { emailVerified: true };
    else userData = { mobileVerified: true };

    const user = await this.userService.updateUser(
      req.user as string,
      userData,
    );

    return { user };
  }

  @UseGuards(AuthGuard('refreshToken'))
  @Get('refresh')
  async refresh(@Req() req: Request) {
    await this.userService.validateRefreshToken(
      req.user as string,
      req.cookies['refreshToken'],
    );

    const accessToken = await this.tokenService.getAccessToken(
      req.user as string,
    );

    return { accessToken };
  }

  @UseGuards(AuthGuard('accessToken'))
  @Get('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.userService.updateRefreshToken(req.user as string, null);
    res.cookie('refreshToken', '', { expires: new Date(Date.now()) });
    return;
  }
}
