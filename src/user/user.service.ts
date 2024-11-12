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
import {
  sendMailToResetPassword,
  sendMailToVerifyUser,
} from '../common/utils/send-to-user';
import { InValidCredentials } from '../errors/exceptions';
import { DataSource, EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BASE_URL } from '../common/constants';
import { AllExceptionsFilter } from '../errors/http-exception.filter';
import Stripe from 'stripe';
import { CardDtos } from '../payment/dto/payment.dto';
import { TransactionScope } from '../base/transactionScope';

@Injectable()
export class UserService extends BaseService {
  private stripe: Stripe;

  constructor(
    private readonly userRepository: UserRepository,
    dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly entityManager:EntityManager

    
  ) {
    super(dataSource);
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  }

  async createUser(input: UserDtos.CreateUserDto, hashedPassword?: string) {
    try {
      const newUser = this.userRepository.create({
        name: input.name,
        username: input.username,
        email: input.email,
        phoneNumber: input.phoneNumber,
        password: hashedPassword ? hashedPassword : '',
        isActive: hashedPassword ? false : true,
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async registerUser(input: UserDtos.RegisterUserDto) {
    const userExist = await this.getUserByEmail(input.email);
    if (userExist) {
      throw new BadRequestException(`Email already registered`);
    }

    const userName = await this.getUserName(input.username);
    if (userName) {
      throw new BadRequestException(`Username already registered`);
    }

    const hashedPassword = await hashPassword(input.password);
    const newUser = await this.createUser(input, hashedPassword);
  // const  stripeClient = await this.stripe.customers.create({
  //     name: newUser.username,
  //     email: newUser.email,
  //     phone: newUser.phoneNumber,
  //   });
    await this.emailVerification(newUser);
    return {
      message: 'User registered successfully',
      userId: newUser.id,
    };
  }
  
  async resendLink(input: UserDtos.ResentUserDto) {
    const userExist = await this.getUserByEmail(input.email);
    if (!userExist) {
      throw new BadRequestException(`email not found`);
    }


    await this.emailVerification(userExist);
    return {
      message: 'Link send successfully',
      userId: userExist.id,
    };
  }

  async login(input: UserDtos.LoginDto): Promise<{ user: Partial<User>; token: string }> {
    try {
      const user = await this.getUserByEmail(input.email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (!user.isActive) throw new UnauthorizedException('Email not verified');

      const isPasswordValid = await verifyPassword(input.password, user.password);
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
      throw new AllExceptionsFilter(error);
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      return this.userRepository.getUserByEmail(email).getOne();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async emailVerify(token: string): Promise<User> {
    try {
      const decodedUser = tokenDecoder(token);
      if (!decodedUser) throw new UnauthorizedException('Invalid authorization specified');

      const user = await this.getUserById(decodedUser.id);
      if (!user) throw new NotFoundException('Invalid credentials specified');

      user.isActive = true;
      await this.userRepository.update(user.id, user);
      return user;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      return this.userRepository.getUserById(id).getOne();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getUserName(username: string): Promise<User> {
    try {
      return this.userRepository.getUserName(username).getOne();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async emailVerification(user: User): Promise<CommonDTOs.MessageResponse> {
    try {
      const token = verifyUserToken(user.id);
      await sendMailToVerifyUser(
        user,
        `${process.env.BACK_END_URL}/user/verify?token=${token}`,
      );

      return { message: 'Check your Email to verify it' };
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async googleLogin(req: { user: { email: string; firstName: any; lastName: any } }) {
    try {
      if (!req.user) {
        throw new BadRequestException('No user information received from Google.');
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
          message: 'User information from Google',
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
      throw new AllExceptionsFilter(error);
    }
  }

  async updateUser(input: UserDtos.UpdateUser, currentUser: CommonDTOs.CurrentUser, file) {
    try {
      const userEmail = currentUser.isAdmin ? input.email : currentUser.email;
      const user = await this.getUserByEmail(userEmail);
      if (!user) throw new InValidCredentials('Invalid user specified');

      if (file) {
        const baseUrl = this.configService.get('BACK_END_BASE_URL') || BASE_URL;
        input.image = `${baseUrl}/uploads/${file.filename}`; // Set complete URL path
      }

      const updatedUser = await this.updateUserDetails(user.id, input);
      return {
        message: 'User updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async updateUserCoins(input: CardDtos.ExisitngCardInputDto, user: User, ts: TransactionScope) {
    try {
     user.availableCoins=Number(user.availableCoins)+Number(input.coins)
     return user
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async updateUserSubtractCoins(coins:number, user: User) {
    const transactionScop=this.getTransactionScope()
    
    try {
     user.availableCoins=coins
     transactionScop.update(user)
     transactionScop.commit(this.entityManager)
     return user
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async updateUserDetails(userId: string, input: UserDtos.UpdateUser) {
    try {
      const user = await this.getUserById(userId);
      if (!user) throw new NotFoundException('User not found');

      if (input.email !== user.email) {
        const emailAlreadyExist = await this.getUserByEmail(input.email);
        if (emailAlreadyExist) throw new InValidCredentials('Email already registered');
      }
      if (input.phoneNumber !== user.phoneNumber) {
        const phoneAlreadyExist = await this.getUserByPhoneNumber(input.phoneNumber);
        if (phoneAlreadyExist) throw new InValidCredentials('Phone number already exists');
      }
      if (input.username !== user.username) {
        const usernameAlreadyExist = await this.getUserByUsername(input.username);
        if (usernameAlreadyExist) throw new InValidCredentials('Username already exists');
      }
      Object.assign(user, input);

      const updatedUser = await this.userRepository.save(user);
      return updatedUser;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User> {
    try {
      return this.userRepository.getUserByPhoneNumber(phoneNumber).getOne();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getUserByUsername(username: string): Promise<User> {
    try {
      return this.userRepository.getUserByUsername(username).getOne();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getAllUser(): Promise<User[]> {
    try {
      return this.userRepository.getAllUser().getMany();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
  async getHistoryByUserId(id:string): Promise<User[]> {
    try {
      return this.userRepository.getHistoryByUserId(id).getMany();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
  async getFigureByUserId(id:string): Promise<User[]> {
    try {
      return this.userRepository.getFigureByUserId(id).getMany();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
  async userTransaction(): Promise<User[]> {
    try {
      return this.userRepository.userTransaction().getMany();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async deleteUser(id: string): Promise<{ message: string; user: User }> {
    try {
      const user = await this.getUserById(id);
      if (!user) throw new NotFoundException('Invalid credentials specified');

      await this.userRepository.delete({ id });
      return {
        message: 'User deleted successfully',
        user,
      };
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async forgotPassword(input: UserDtos.ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.getUserByEmail(input.email);
    if (!user) {
      throw new NotFoundException(`No user found with the email ${input.email}`);
    }

    const payload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    const resetToken = signToken(payload);
    await sendMailToResetPassword(
      user,
      `${process.env.BACK_END_URL}/user/resetpassword-verification?token=${resetToken}`,
    );

    return { message: 'Password reset link sent to your email' };
  }

  async resetPassword(input: UserDtos.ResetPasswordDto): Promise<{ message: string }> {
    const decodedToken = tokenDecoder(input.token);
    const user = await this.getUserById(decodedToken.id);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(input.newPassword);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password reset successful' };
  }

  async changePassword(
    input: UserDtos.ChangePasswordDto,
    currentUser: CommonDTOs.CurrentUser,
  ): Promise<{ message: string }> {
    const user = await this.getUserById(currentUser.id);
    if (!user) {
      throw new InValidCredentials('Invalid user specified');
    }

    const isPasswordValid = await verifyPassword(input.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new InValidCredentials('Old password is incorrect');
    }

    const hashedPassword = await hashPassword(input.newPassword);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }
}
