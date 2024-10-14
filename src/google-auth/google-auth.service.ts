import { UserService } from './../user/user.service';
import { Injectable } from '@nestjs/common';
import { CreateGoogleAuthDto } from './dto/create-google-auth.dto';
import { UpdateGoogleAuthDto } from './dto/update-google-auth.dto';
import { signToken } from 'src/common/utils/assign-and-decode-token';

@Injectable()
export class GoogleAuthService {
  constructor(private readonly userService: UserService) {}
  async googleLogin(req) {
    try {
      
    
      if (!req.user) {
        throw new Error('No user information received from Google.');
      }

    const user = await this.userService.getUserByEmail(req.user.email);
   
    if (!user) {
      const input = {
        email: req.user.email,
         name: `${req.user.firstName} ${req.user.lastName}`, 
        username: req.user.email,
        isActive: true,
        phoneNumber: '',
      };
      const newUser = await this.userService.createUser(input);
      return {
        message: 'User information from google',
        user: newUser,
      };
    } else {
      const payload = {
        email: user.email,
        id: user.id,
        isAdmin: user.isAdmin,
      };
      const token = signToken(payload);

      const { password, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token };
    }
  } catch (error) {
    throw new Error(`Google login failed: ${error.message}`);
  }
  }
}
