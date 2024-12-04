// src/bundles/bundles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageBundle } from './entities/package-bundle.entity';
import { PackageBundlesController } from './package-bundle.controller';
import { PackageBundlesService } from './package-bundle.service';
import { UserModule } from '../user/user.module';
import { ConfigService } from '@nestjs/config';
import { UserPackageBundlesModule } from '../user-package-bundle/user-package-bundle.module';
import { UserService } from '../user/user.service';
import { UserPackageBundlesService } from '../user-package-bundle/user-package-bundle.service';
import { AIFigureRepository } from '../aifigure/aifigure.repository';
import { ArenaRepository } from '../arena/arena.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PackageBundle]),
    UserModule,
    UserPackageBundlesModule,
    // BundleFeatureModule, // Import BundleFeatureModule
  ],
  controllers: [PackageBundlesController],
  providers: [
    PackageBundlesService,
    ConfigService,
    UserService,
    UserPackageBundlesService,
    AIFigureRepository,
    ArenaRepository
  ],
})
export class PackageBundlesModule {}
