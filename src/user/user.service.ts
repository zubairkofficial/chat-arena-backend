import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDtos } from './dto/user.dto';
import { User } from './entities/user.entity';
import { BaseService } from '../base/base.service';
import { UserRepository } from './user.repository';
import { hashPassword, verifyPassword } from '../common/utils/bcrypt';
import {
  signToken,
  tokenDecoder,
  verifyUserToken,
} from '../common/utils/assign-and-decode-token';
import { CommonDTOs } from '../common/dto';
import { sendMailToVerifyUser } from '../common/utils/send-to-user';
@Injectable()
export class UserService extends BaseService {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

   async createUser(
    input: UserDtos.CreateUserDto,
    hashedPassword?: string,
  ) {
    const newUser = this.userRepository.create({
      name: input.name,
      username: input.username,
      email: input.email,
      phoneNumber: input.phoneNumber,
      password: hashedPassword ? hashedPassword : '',
      isActive: hashedPassword ? false : true,
    });
    return await this.userRepository.save(newUser);
  }

  async registerUser(input: UserDtos.RegisterUserDto) {
    const userExist = await this.getUserByEmail(input.email);
    if (userExist) {
      throw new BadRequestException(`Email already registered`);
    }
    const userName = await this.getUserName(input.username);
    if (userName) {
      throw new BadRequestException(`userName already registered`);
    }

    const hashedPassword = await hashPassword(input.password);

    const newUser = await this.createUser(input, hashedPassword);
    await this.emailVerification(newUser);
    return {
      message: 'User registered successfully',
      userId: newUser.id,
    };
  }

  async login(
    input: UserDtos.LoginDto,
  ): Promise<{ user: Partial<User>; token: string }> {
    try {
      const user = await this.getUserByEmail(input.email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (!user.isActive) throw new UnauthorizedException('email not verified');
      // Compare password
      const isPasswordValid = await verifyPassword(
        input.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload = {
        email: user.email,
        id: user.id,
        isAdmin: user.isAdmin,
      };
      const token = signToken(payload);

      const { password, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      return this.userRepository.getUserByEmail(email).getOne();
    } catch (error) {
      throw new Error(error);
    }
  }
  async emailVerify(token: string): Promise<User> {
    try {
      const decodedUser = tokenDecoder(token);
      if (!decodedUser)
        throw new UnauthorizedException('Invalid authorization specified');
      const user = await this.getUserById(decodedUser.id);
      if (!user) throw new NotFoundException('Invalid credentials specified');

      if (!user.isActive) user.isActive = true;
      await this.userRepository.update(user.id, user);
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      return this.userRepository.getUserById(id).getOne();
    } catch (error) {
      throw new Error(error);
    }
  }
  async getUserName(username: string): Promise<User> {
    try {
      return this.userRepository.getUserName(username).getOne();
    } catch (error) {
      throw new Error(error);
    }
  }
  async emailVerification(user: User): Promise<CommonDTOs.MessageResponse> {
    try {
      const token = verifyUserToken(user.id);
      await sendMailToVerifyUser(
        user,
        process.env.BACK_END_URL + '/user/verify?token=' + token,
      );

      return { message: 'Check your Email to verify it' };
    } catch (error) {
      throw new Error(error);
    }
  }

  async googleLogin(req) {
    try {
      
    
      if (!req.user) {
        throw new Error('No user information received from Google.');
      }

    const user = await this.getUserByEmail(req.user.email);
   
    if (!user) {
      const input = {
        email: req.user.email,
         name: `${req.user.firstName} ${req.user.lastName}`, 
        username: req.user.email,
        isActive: true,
        phoneNumber: '',
      };
      const newUser = await this.createUser(input);
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