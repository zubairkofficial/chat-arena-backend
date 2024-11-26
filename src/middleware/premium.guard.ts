import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { UserTier } from "../common/enums";

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id; // Assuming user is authenticated
    const tier = await this.userService.getUserTier(userId);
    return tier === UserTier.PREMIUM; // Only allow access if user is premium
  }
}