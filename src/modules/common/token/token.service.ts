import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getAccessToken(userId: string) {
    return await this.jwtService.signAsync(
      { id: userId },
      {
        secret:
          this.configService.get('ACCESS_TOKEN_SECRET') ||
          'sampleaccesstokensecret',
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRY') || '30m',
      },
    );
  }

  async getRefreshToken(userId: string) {
    return await this.jwtService.signAsync(
      { id: userId },
      {
        secret:
          this.configService.get('REFRESH_TOKEN_SECRET') ||
          'samplerefreshtokensecret',
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRY') || '15d',
      },
    );
  }
}
