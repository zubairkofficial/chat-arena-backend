// src/upload/upload.controller.ts
import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

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
    uploadSingle(@UploadedFile() file) {
        return {
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
        };
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
    uploadMultiple(@UploadedFiles() files) {
        return files.map(file => ({
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
        }));
    }
}
