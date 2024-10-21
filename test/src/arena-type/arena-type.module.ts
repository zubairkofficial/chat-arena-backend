import { Module } from '@nestjs/common';
import { ArenaTypeService } from './arena-type.service';
import { ArenaTypeController } from './arena-type.controller';
import { ArenaTypeRepository } from './arena-type.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArenaType } from './entities/arena-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArenaType]), // Register the entity for dependency injection
  ],
  controllers: [ArenaTypeController],
  providers: [ArenaTypeService, ArenaTypeRepository],
})
export class ArenaTypeModule {}
