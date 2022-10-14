import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('accessToken'))
  @Get()
  async getUser(@Req() req: Request) {
    const user = await this.userService.getUserById(req.user as string);
    delete user.draft;
    return user;
  }

  @UseGuards(AuthGuard('accessToken'))
  @Post('update')
  async updateUser(@Req() req: Request, @Body() data: UpdateUserDto) {
    const user = await this.userService.updateUser(req.user as string, data);
    delete user.draft;
    return user;
  }
}
