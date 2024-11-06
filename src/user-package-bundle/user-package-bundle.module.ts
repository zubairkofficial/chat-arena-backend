// src/user-package-bundles/user-package-bundles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPackageBundle } from './entities/user-package-bundle.entity';
import { UserPackageBundlesController } from './user-package-bundle.controller';
import { UserPackageBundlesService } from './user-package-bundle.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPackageBundle]), // Only the entity, not forwardRef
  ],
  controllers: [UserPackageBundlesController],
  providers: [UserPackageBundlesService,],
  exports: [UserPackageBundlesService, TypeOrmModule], // Export the service and TypeOrmModule for use in other modules
})
export class UserPackageBundlesModule {}
