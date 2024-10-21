import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ResponseStyleService } from './response-style.service';
import { CreateResponseStyleDto } from './dto/create-response-style.dto';
import { UpdateResponseStyleDto } from './dto/update-response-style.dto';

@Controller('response-style')
export class ResponseStyleController {
  constructor(private readonly responseStyleService: ResponseStyleService) {}

  @Post()
  create(@Body() createResponseStyleDto: CreateResponseStyleDto) {
    return this.responseStyleService.create(createResponseStyleDto);
  }

  @Get()
  findAll() {
    return this.responseStyleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.responseStyleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResponseStyleDto: UpdateResponseStyleDto,
  ) {
    return this.responseStyleService.update(id, updateResponseStyleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.responseStyleService.remove(id);
  }
}
