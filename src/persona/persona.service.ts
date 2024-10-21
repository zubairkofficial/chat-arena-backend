import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';
import { PersonaDto } from './dto/persona.dto';

@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
  ) {}

  // Create a new persona
  async create(
    createPersonaDto: PersonaDto.CreatePersonaDto,
  ): Promise<Persona> {
    const persona = this.personaRepository.create(createPersonaDto);
    return this.personaRepository.save(persona);
  }

  // Find all personas
  async findAll(): Promise<Persona[]> {
    return this.personaRepository.find();
  }

  // Find a single persona by ID
  async findOne(id: string): Promise<Persona> {
    const persona = await this.personaRepository.findOne({ where: { id } });
    if (!persona) {
      throw new NotFoundException(`Persona with ID ${id} not found`);
    }
    return persona;
  }

  // Update a persona by ID
  async update(
    id: string,
    updatePersonaDto: PersonaDto.UpdatePersonaDto,
  ): Promise<Persona> {
    const persona = await this.findOne(id);
    Object.assign(persona, updatePersonaDto);
    return this.personaRepository.save(persona);
  }

  // Delete a persona by ID
  async remove(id: string): Promise<void> {
    const result = await this.personaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Persona with ID ${id} not found`);
    }
  }
}
