import {
    Controller,
    Get,
    UseGuards,
    HttpStatus,
    Req,
   
  } from '@nestjs/common';
  import { AuthGuard } from '../middleware/auth.middleware';
  import { handleServiceError } from '../errors/error-handling';
import { ErrorLogService } from './error-logs.service';
  
  @Controller('error-logs')
  export class ErrorLogsController {
    constructor(
      private readonly errorLogService: ErrorLogService,
  
    ) {

     }
  
    @Get('')
    @UseGuards(AuthGuard)
    async getAllUser(@Req() req) {
      try {
        return await this.errorLogService.getAllError();
      } catch (error) {
        handleServiceError(
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to retrieve users',
        );
      }
    }

  
    // @Get(':id')
    // @UseGuards(AuthGuard)
    // async getUserById(@Req() req, @Param() param) {
    //   try {
    //     return await this.errorLogService.getUserById(param.id);
    //   } catch (error) {
    //     handleServiceError(
    //       error,
    //       HttpStatus.INTERNAL_SERVER_ERROR,
    //       'Failed to retrieve user',
    //     );
    //   }
    // }
  }
  