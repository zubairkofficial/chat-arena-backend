import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PackageBundle } from './entities/package-bundle.entity';
import { PackageBundleDtos } from './dto/package-bundle.dto';
import { PackageBundleRepository } from './package-bundle.repository';
import { BaseService } from '../base/base.service';
import { DataSource, EntityManager } from 'typeorm';
import { UserPackageBundlesService } from '../user-package-bundle/user-package-bundle.service';
import { CommonDTOs } from '../common/dto';
import { UserService } from '../user/user.service';
import { AllExceptionsFilter } from '../errors/http-exception.filter'; // Adjust the import if necessary

@Injectable()
export class PackageBundlesService extends BaseService {
  constructor(
    @InjectRepository(PackageBundle)
    private packageBundleRepository: PackageBundleRepository,
    private userPackageBundlesService: UserPackageBundlesService,
    private userService: UserService,
   
    private entityManager: EntityManager,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  async createPackageBundle(
    input: PackageBundleDtos.CreatePackageBundleDto,
    currentUser: CommonDTOs.CurrentUser,
  ): Promise<PackageBundle> {
    const user = await this.userService.getUserById(currentUser.id);
    const transactionScope = this.getTransactionScope();
    const packageBundle = new PackageBundle();

    packageBundle.coins = input.coins;
    packageBundle.name = input.name;
    packageBundle.price = input.price;
    packageBundle.featureNames = input.featureNames;
    packageBundle.durationInDays = input.durationInDays;
   if(input.description) packageBundle.description = input.description;
    transactionScope.add(packageBundle);

    const userPackageBundle =
      await this.userPackageBundlesService.addPackageToUser(
        user,
        packageBundle,
      );
    transactionScope.add(userPackageBundle);
     try {
      await transactionScope.commit(this.entityManager);
      return packageBundle;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getAllPackageBundles(): Promise<PackageBundle[]> {
    try {
      return await this.packageBundleRepository.find({
        order: {
          createdAt: 'DESC', // Sort by createdAt, adjust as needed
        },
      });
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getPackageBundleById(id: string): Promise<PackageBundle> {
    try {
      const packageBundle = await this.packageBundleRepository.findOne({
        where: { id },
      });
      if (!packageBundle) {
        throw new NotFoundException(`Package bundle with ID ${id} not found.`);
      }
      return packageBundle;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async updatePackageBundle(
    id: string,
    input: PackageBundleDtos.UpdatePackageBundleDto,
  ): Promise<PackageBundle> {
    const existingBundle = await this.getPackageBundleById(id); // Ensure the bundle exists
    if (!existingBundle) throw new NotFoundException('bundle not found');
    // Update fields
    if (input.name) existingBundle.name = input.name 
    if (input.price) existingBundle.price = input.price 
    if (input.coins) existingBundle.coins = input.coins 
    if (input.featureNames) existingBundle.featureNames = input.featureNames;
    if (input.durationInDays) existingBundle.durationInDays = input.durationInDays;
    if (input.description) existingBundle.description = input.description;
    try {
      await this.packageBundleRepository.save(existingBundle); // Save updated package bundle
      return existingBundle; // Return the updated bundle
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async deletePackageBundle(id: string): Promise<void> {
    const packageBundle = await this.getPackageBundleById(id); // Ensure it exists

    try {
      await this.packageBundleRepository.delete(packageBundle.id); // Delete the package bundle
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
}
