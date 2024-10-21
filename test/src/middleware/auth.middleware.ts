import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { tokenDecoder } from '../common/utils/assign-and-decode-token';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const decoded = token.split(' ')[1];
      const decodedUser = tokenDecoder(decoded);
      request.user = decodedUser; // Attach the decoded user to the request object
      return true; // Allow access
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
