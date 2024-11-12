import { STATUS_CODES } from '../common/constants/status-codes';

export class HttpException extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request') {
    super(message, STATUS_CODES.BAD_REQUEST);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(message, STATUS_CODES.UNAUTHORIZED);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = 'Not Found') {
    super(message, STATUS_CODES.NOT_FOUND);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(message, STATUS_CODES.FORBIDDEN);
  }
}

export class NotAcceptableException extends HttpException {
  constructor(message = 'Not Acceptable') {
    super(message, STATUS_CODES.NOT_ACCEPTABLE);
  }
}

export class RequestTimeoutException extends HttpException {
  constructor(message = 'Request Timeout') {
    super(message, STATUS_CODES.REQUEST_TIMEOUT);
  }
}

export class ConflictException extends HttpException {
  constructor(message = 'Conflict') {
    super(message, STATUS_CODES.CONFLICT);
  }
}

export class GoneException extends HttpException {
  constructor(message = 'Gone') {
    super(message, STATUS_CODES.GONE);
  }
}

export class HttpVersionNotSupportedException extends HttpException {
  constructor(message = 'HTTP Version Not Supported') {
    super(message, STATUS_CODES.HTTP_VERSION_NOT_SUPPORTED);
  }
}

export class PayloadTooLargeException extends HttpException {
  constructor(message = 'Payload Too Large') {
    super(message, STATUS_CODES.PAYLOAD_TOO_LARGE);
  }
}

export class UnsupportedMediaTypeException extends HttpException {
  constructor(message = 'Unsupported Media Type') {
    super(message, STATUS_CODES.UNSUPPORTED_MEDIA_TYPE);
  }
}
export class TooManyRequestsException extends HttpException {
  constructor(message = 'Too Many Requests') {
    super(message, STATUS_CODES.TOO_MANY_REQUESTS);
  }
}
export class UnprocessableEntityException extends HttpException {
  constructor(message = 'Unprocessable Entity') {
    super(message, STATUS_CODES.UNPROCESSABLE_ENTITY);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message = 'Internal Server Error') {
    super(message, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}

export class NotImplementedException extends HttpException {
  constructor(message = 'Not Implemented') {
    super(message, STATUS_CODES.NOT_IMPLEMENTED);
  }
}

export class ImATeapotException extends HttpException {
  constructor(message = "I'm a teapot") {
    super(message, STATUS_CODES.IM_A_TEAPOT);
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor(message = 'Method Not Allowed') {
    super(message, STATUS_CODES.METHOD_NOT_ALLOWED);
  }
}

export class BadGatewayException extends HttpException {
  constructor(message = 'Bad Gateway') {
    super(message, STATUS_CODES.BAD_GATEWAY);
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message = 'Service Unavailable') {
    super(message, STATUS_CODES.SERVICE_UNAVAILABLE);
  }
}

export class GatewayTimeoutException extends HttpException {
  constructor(message = 'Gateway Timeout') {
    super(message, STATUS_CODES.GATEWAY_TIMEOUT);
  }
}

export class PreconditionFailedException extends HttpException {
  constructor(message = 'Precondition Failed') {
    super(message, STATUS_CODES.PRECONDITION_FAILED);
  }
}

export class NoRecordFoundException extends HttpException {
  constructor(message = 'No Record Found') {
    super(message, STATUS_CODES.NOT_FOUND);
  }
}

export class InValidCredentials extends HttpException {
  constructor(message = 'InValid Credentials') {
    super(message, STATUS_CODES.BAD_REQUEST);
  }
}

export class ServerNotConnectedException extends HttpException {
  constructor(message = 'Server Not Connected') {
    super(message, STATUS_CODES.SERVICE_UNAVAILABLE);
  }
}
