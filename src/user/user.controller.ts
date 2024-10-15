import { Controller, Get, Post, Body,Query, Res, UseGuards, Req, Put, Delete, Param} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDtos } from './dto/user.dto';
import { Response } from 'express';
import { AuthGuard } from '../middleware/auth.middleware';
import { Request } from 'express';
import { CommonDTOs } from '../common/dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  registerUser(@Body() input: UserDtos.RegisterUserDto) {
    return this.userService.registerUser(input);
  }

  @Post('login')
  async login(@Body() loginDto: UserDtos.LoginDto) {
    try {
      
    
    return this.userService.login(loginDto);
    }catch (error) {
      throw new Error(error.message);
    }
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

  @Put('update')
  @UseGuards(AuthGuard)
  async updateUser(@Req() req: Request, @Body() input: UserDtos.UpdateUser) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser; // Access the email from the user object
      return this.userService.updateUser(input,currentUser);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteUser(@Req() req: Request,@Param() param) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser; // Access the email from the user object
      return this.userService.deleteUser(param.id,currentUser);
    } catch (error) {
      throw new Error(error.message);
    }
  }


}
