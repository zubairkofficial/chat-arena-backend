import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { UserArenaService } from './user-arena.service';
import { CreateUserArenaDto } from './dto/create-user-arena.dto';
import { UpdateUserArenaDto } from './dto/update-user-arena.dto';

@Controller('user-arena')
export class UserArenaController {
  constructor(private readonly userArenaService: UserArenaService) {}

  


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userArenaService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserArenaDto: UpdateUserArenaDto,
  ) {
    return this.userArenaService.update(id, updateUserArenaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userArenaService.remove(id);
  }
}
