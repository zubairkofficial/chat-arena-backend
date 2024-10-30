import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
  Put,
  Delete,
  HttpStatus,
  Req,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDtos } from './dto/user.dto';
import { AuthGuard } from '../middleware/auth.middleware';
import { CommonDTOs } from '../common/dto';
import { handleServiceError } from '../errors/error-handling';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from '../utils/file-upload.utils';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,

  ) { }

  @Post('register')
  async registerUser(@Body() input: UserDtos.RegisterUserDto) {
    try {
      return await this.userService.registerUser(input);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to register user',
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: UserDtos.LoginDto) {
    try {
      return await this.userService.login(loginDto);
    } catch (error) {
      handleServiceError(error, HttpStatus.UNAUTHORIZED, 'Login failed');
    }
  }


  @Get('verify')
  async emailVerify(@Query('token') token: string, @Res() res) {
    try {
      await this.userService.emailVerify(token);
      res
        .writeHead(301, { Location: `${process.env.FRONTEND_APP_URL}/login` })
        .end();
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Email verification failed',
      );
    }
  }

  @Get('resetpassword-verification')
  async forgotPasswordVerify(@Query('token') token: string, @Res() res) {
    try {
      await this.userService.emailVerify(token);
      res
        .writeHead(301, {
          Location: `${process.env.FRONTEND_APP_URL}/reset-password?token=${token}`,
        })
        .end();
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Password reset verification failed',
      );
    }
  }

  @Put('update')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: storageConfig('./uploads'), // Specify the uploads directory
  }))
  async updateUser(@Req() req, @Body() input: UserDtos.UpdateUser, @UploadedFile() file, // Handle the uploaded file
  ) {
    try {

      const currentUser = req.user as CommonDTOs.CurrentUser; // Access the user object
      return await this.userService.updateUser(input, currentUser, file);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update user',
      );
    }
  }

  @Get('all-users')
  @UseGuards(AuthGuard)
  async getAllUser(@Req() req) {
    try {
      return await this.userService.getAllUser();
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve users',
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteUser(@Req() req, @Param() param) {
    try {
      return await this.userService.deleteUser(param.id);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete user',
      );
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getUserById(@Req() req, @Param() param) {
    try {
      return await this.userService.getUserById(param.id);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve user',
      );
    }
  }

  @Get('/history/all')
  @UseGuards(AuthGuard)
  async getHistoryByUserId(@Req() req) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser; 
      return await this.userService.getHistoryByUserId(currentUser.id);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve user',
      );
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() input: UserDtos.ForgotPasswordDto) {
    try {
      return await this.userService.forgotPassword(input);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to initiate password reset',
      );
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() input: UserDtos.ResetPasswordDto) {
    try {
      return await this.userService.resetPassword(input);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to reset password',
      );
    }
  }
  @Post('change-password')
  @UseGuards(AuthGuard)
  async changePassword(@Req() req, @Body() input: UserDtos.ChangePasswordDto) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser;
      return await this.userService.changePassword(input, currentUser);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to reset password',
      );
    }
  }
}
