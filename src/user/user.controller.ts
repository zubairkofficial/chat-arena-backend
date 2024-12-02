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
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDtos } from './dto/user.dto';
import { AuthGuard } from '../middleware/auth.middleware';
import { CommonDTOs } from '../common/dto';
import { handleServiceError } from '../errors/error-handling';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from '../utils/file-upload.utils';
import { AIFigureStatus, ArenaRequestStatus } from '../common/enums';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Post('resent-link')
  async resendLink(@Body() input: UserDtos.ResentUserDto) {
    try {
      return await this.userService.resendLink(input);
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
      handleServiceError(
        error.errorLogService,
        HttpStatus.UNAUTHORIZED,
        'Login failed',
      );
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storageConfig('./uploads'), // Specify the uploads directory for file storage
    }),
  )
  async updateUser(
    @Req() req,
    @Body() input: UserDtos.UpdateUser,
    @UploadedFile() file, // Handle the uploaded file
  ) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser; // Access the user object from request

      // Check if the file is provided and validate it
      if (file) {
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
          throw new Error(
            'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
          );
        }
      }

      // Pass the data to the service for processing
      return await this.userService.updateUser(input, currentUser, file);
    } catch (error) {
       handleServiceError(
          error.errorLogService,
          HttpStatus.BAD_REQUEST,
          'Failed to update user',
        );
      

      // Otherwise, handle generic errors
      handleServiceError(
        error.errorLogService,
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

  @Get('userInfo-count/:id')
  @UseGuards(AuthGuard)
  async getUserByIdWithJoins(@Req() req, @Param() param) {
    try {
      return await this.userService.getUserByIdWithJoins(param.id);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve user',
      );
    }
  }

  @Post('pending-status')
  @UseGuards(AuthGuard)
  async getUsersWithPendingStatus(@Req() req) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser;
      if (!currentUser.isAdmin)
        throw new BadRequestException('user does not access');

      return await this.userService.getUsersWithPendingStatus();
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve pending status user',
      );
    }
  }
  @Post('aifigure/pending-status')
  @UseGuards(AuthGuard)
  async getUsersWithAiFigurePendingStatus(@Req() req) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser;
      if (!currentUser.isAdmin)
        throw new BadRequestException('user does not access');

      return await this.userService.getUsersWithAiFigurePendingStatus();
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve pending status user',
      );
    }
  }

  @Get('history/all')
  @UseGuards(AuthGuard)
  async getHistoryByUserId(@Req() req) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser;
      return await this.userService.getHistoryByUserId(currentUser.id);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve user history',
      );
    }
  }

  @Get('history/figure-list')
  @UseGuards(AuthGuard)
  async getFigureByUserId(@Req() req) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser;
      return await this.userService.getFigureByUserId(currentUser.id);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve user history',
      );
    }
  }

  @Get('transaction/history')
  @UseGuards(AuthGuard)
  async userTransaction(@Req() req) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser;
      if (!currentUser.isAdmin)
        throw new BadRequestException('user does not access');
      return this.userService.userTransaction();
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve user history',
      );
    }
  }

  @Post('forget-password')
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

  @Post('request-arena')
  @UseGuards(AuthGuard)
  async arenaRequest(@Req() req) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser;
      return await this.userService.arenaRequest(currentUser);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to reset password',
      );
    }
  }

  @Post('request-aifigure')
  @UseGuards(AuthGuard)
  async aiFigureRequest(@Req() req) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser;
      return await this.userService.aiFigureRequest(currentUser);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to reset password',
      );
    }
  }

  @Put('update-request-status/:userId')
  @UseGuards(AuthGuard) // Only admin can access this route
  async updateArenaRequestStatus(
    @Param('userId') userId: string, // Getting the user ID from the URL
    @Body('status') status: ArenaRequestStatus, // Getting the new status from the body
    @Req() req,
  ) {
    const currentUser = req.user as CommonDTOs.CurrentUser;
    if (!currentUser.isAdmin)
      throw new BadRequestException('user does not access');

    const result = await this.userService.updateArenaRequestStatus(
      userId,
      status,
    );
    return result;
  }

  @Put('update-aifigure-request/:userId')
  @UseGuards(AuthGuard) // Only admin can access this route
  async updateAiFigureRequestStatus(
    @Param('userId') userId: string, // Getting the user ID from the URL
    @Body('status') status: AIFigureStatus, // Getting the new status from the body
    @Req() req,
  ) {
    const currentUser = req.user as CommonDTOs.CurrentUser;
    if (!currentUser.isAdmin)
      throw new BadRequestException('user does not access');

    const result = await this.userService.updateAiFigureRequestStatus(
      userId,
      status,
    );
    return result;
  }
}
