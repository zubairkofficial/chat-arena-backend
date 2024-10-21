import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('google-auth')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Get('/')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      const { user, token } = await this.googleAuthService.googleLogin(req);

      // Encode user data
      const encodedUser = encodeURIComponent(JSON.stringify(user));
      const redirectUrl = `${process.env.FRONTEND_APP_URL}/login?token=${token}&user=${encodedUser}`;

      // Redirect to the frontend application
      return res.redirect(redirectUrl);
    } catch (error) {
      return res.status(500).send(`Google login failed: ${error.message}`);
    }
  }
}
