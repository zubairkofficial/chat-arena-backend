import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req, BadRequestException, HttpStatus } from '@nestjs/common';
import { PackageBundlesService } from './package-bundle.service';
import { PackageBundleDtos } from './dto/package-bundle.dto';
import { CommonDTOs } from '../common/dto';
import { AuthGuard } from '../middleware/auth.middleware';
import { handleServiceError } from '../errors/error-handling'; // Import your error handling utility

@Controller('package-bundles')
export class PackageBundlesController {
  constructor(private readonly packageBundlesService: PackageBundlesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createPackageBundle(@Req() req, @Body() input: PackageBundleDtos.CreatePackageBundleDto) {
    const currentUser = req.user as CommonDTOs.CurrentUser; // Access the user object
    if (!currentUser.isAdmin) {
      throw new BadRequestException("Invalid user specified");
    }
    try {
      return await this.packageBundlesService.createPackageBundle(input, currentUser);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to create package bundle');
    }
  }

  @Get()
  async getAllPackageBundles() {
    try {
      return await this.packageBundlesService.getAllPackageBundles();
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve package bundles');
    }
  }

  @Get(':id')
  async getPackageBundleById(@Param('id') id: string) {
    try {
      return await this.packageBundlesService.getPackageBundleById(id);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.NOT_FOUND, 'Package bundle not found');
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updatePackageBundle(
    @Req() req,
    @Param('id') id: string, 
    @Body() updatePackageBundleDto: PackageBundleDtos.UpdatePackageBundleDto,
  ) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser; // Access the user object
      if (!currentUser.isAdmin) {
        throw new BadRequestException("Invalid user specified");
      }
      return await this.packageBundlesService.updatePackageBundle(id, updatePackageBundleDto);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to update package bundle');
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deletePackageBundle(@Param('id') id: string,@Req() req,) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser; // Access the user object
      if (!currentUser.isAdmin) {
        throw new BadRequestException("Invalid user specified");
      }
      return await this.packageBundlesService.deletePackageBundle(id);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete package bundle');
    }
  }
}
