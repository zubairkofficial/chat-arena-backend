import { HttpException, HttpStatus } from '@nestjs/common';

export function handleServiceError(
  error: {status:number,message:string},
  defaultStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  defaultMessage: string = 'An unexpected error occurred',
) {
  const status = error.status || defaultStatus;
  const message = error.message || defaultMessage;
  
  throw new HttpException(message, status);
}
