import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors, HttpStatus, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { handleServiceError } from '../errors/error-handling'; // Assuming you have a service that handles errors

@Controller('upload')
export class UploadController {
    @Post('single')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                // Generate a unique filename
                const uniqueName = `${Date.now()}-${file.originalname}`;
                cb(null, uniqueName);
            }
        })
    }))
    async uploadSingle(@UploadedFile() file) {
        try {
            if (!file) {
                throw new BadRequestException('No file uploaded');
            }

            return {
                originalname: file.originalname,
                filename: file.filename,
                path: file.path,
            };
        } catch (error) {
            handleServiceError(
                error,
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Failed to upload file',
            );
        }
    }

    @Post('multiple')
    @UseInterceptors(FilesInterceptor('files', 10, {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueName = `${Date.now()}-${file.originalname}`;
                cb(null, uniqueName);
            }
        })
    }))
    async uploadMultiple(@UploadedFiles() files) {
        try {
            if (!files || files.length === 0) {
                throw new BadRequestException('No files uploaded');
            }

            return files.map(file => ({
                originalname: file.originalname,
                filename: file.filename,
                path: file.path,
            }));
        } catch (error) {
            handleServiceError(
                error,
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Failed to upload files',
            );
        }
    }
}
