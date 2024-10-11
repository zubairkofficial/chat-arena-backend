import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDtos } from './dto/user.dto';
import { Response } from 'express';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  registerUser(@Body() input: UserDtos.RegisterDto) {
    return this.userService.registerUser(input);
  }

  @Post('login')
  async login(@Body() loginDto: UserDtos.LoginDto) {
    return this.userService.login(loginDto);
  }

  @Get('verify')
  async emailVerify(@Query('token') token: string,@Res() res: Response) {
     await this.userService.emailVerify(token);
    res
    .writeHead(301, {
      Location: `${process.env.FRONTEND_APP_URL}/login`,
    })
    .end();
   
  }
 
}
