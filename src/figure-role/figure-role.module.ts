import { Module } from '@nestjs/common';
import { FigureRoleService } from './figure-role.service';
import { FigureRoleController } from './figure-role.controller';
import { FigureRoleRepository } from './figure-role.repository';

@Module({
  controllers: [FigureRoleController],
  providers: [FigureRoleService,FigureRoleRepository],
})
export class FigureRoleModule {}
