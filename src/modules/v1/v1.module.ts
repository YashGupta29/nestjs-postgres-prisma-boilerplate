import { Module } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

const routes: Routes = [
  {
    path: '/v1',
    children: [
      { path: '/auth', module: AuthModule },
      { path: '/user', module: UserModule },
    ],
  },
];

@Module({
  imports: [RouterModule.register(routes), AuthModule, UserModule],
})
export class V1Module {}
