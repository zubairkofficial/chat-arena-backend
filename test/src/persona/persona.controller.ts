import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { PersonaService } from './persona.service';
import { PersonaDto } from './dto/persona.dto';

@Controller('personas')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  // Create a new persona
  @Post()
  create(@Body() createPersonaDto: PersonaDto.CreatePersonaDto) {
    return this.personaService.create(createPersonaDto);
  }

  // Get all personas
  @Get()
  findAll() {
    return this.personaService.findAll();
  }

  // Get a specific persona by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personaService.findOne(id);
  }

  // Update a persona by ID
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePersonaDto: PersonaDto.UpdatePersonaDto,
  ) {
    return this.personaService.update(id, updatePersonaDto);
  }

  // Delete a persona by ID
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personaService.remove(id);
  }
}
