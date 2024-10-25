// file-upload.utils.ts

import { diskStorage } from 'multer';
import { extname } from 'path';

export function storageConfig(destination: string) {
  return diskStorage({
    destination, // Custom directory based on input
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtName = extname(file.originalname);
      const fileName = `${uniqueSuffix}${fileExtName}`;
      callback(null, fileName);
    },
  });
}
