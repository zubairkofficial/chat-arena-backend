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

@Injectable()
export class UserService extends BaseService {
  constructor(
    private readonly userRepository: UserRepository,
    dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {
    super(dataSource);
  }

  async createUser(input: UserDtos.CreateUserDto, hashedPassword?: string) {
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

  async googleLogin(req: {
    user: { email: string; firstName: any; lastName: any };
  }) {
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

  async updateUser(
    input: UserDtos.UpdateUser,
    currentUser: CommonDTOs.CurrentUser,
    file: Express.Multer.File,
  ) {
    try {
      const userEmail = currentUser.isAdmin ? input.email : currentUser.email;

      const user = await this.getUserByEmail(userEmail);
      if (!user) throw new InValidCredentials('Invalid user specified');

      if (file) {
        const baseUrl = this.configService.get('BASE_URL') || BASE_URL;
        input.image = `${baseUrl}/uploads/${file.filename}`; // Set complete URL path
      }

      const updatedUser = await this.updateUserDetails(user.id, input);

      return {
        message: 'User updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async updateUserDetails(userId: string, input: UserDtos.UpdateUser) {
    try {
      const user = await this.getUserById(userId); // Assuming TypeORM

      if (!user) {
        throw new Error('User not found');
      }
      if (input.email !== user.email) {
        const emailAlreadyExist = await this.getUserByEmail(input.email);
        if (emailAlreadyExist)
          throw new InValidCredentials('Email already Registered');
      }
      if (input.phoneNumber !== user.phoneNumber) {
        const phoneAlreadyExist = await this.getUserByPhoneNumber(
          input.phoneNumber,
        );
        if (phoneAlreadyExist)
          throw new InValidCredentials('PhoneNumber already exist');
      }
      if (input.username !== user.username) {
        const usernameAlreadyExist = await this.getUserByUsername(
          input.username,
        );
        if (usernameAlreadyExist)
          throw new InValidCredentials('username already exist');
      }
      Object.assign(user, input);

      const updatedUser = await this.userRepository.save(user);

      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User> {
    try {
      return this.userRepository.getUserByPhoneNumber(phoneNumber).getOne();
    } catch (error) {
      throw new Error(error);
    }
  }
  async getUserByUsername(username: string): Promise<User> {
    try {
      return this.userRepository.getUserByUsername(username).getOne();
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllUser(): Promise<User[]> {
    try {
      return this.userRepository.getAllUser().getMany();
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  }

  async deleteUser(id: string): Promise<{ message: string; user: User }> {
    try {
      const user = await this.getUserById(id);

      if (!user) throw new InValidCredentials('Invalid credentials specified');

      await this.userRepository.delete({ id });

      return {
        message: 'User deleted successfully',
        user,
      };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async forgotPassword(
    input: UserDtos.ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.getUserByEmail(input.email);

    if (!user) {
      throw new NotFoundException(
        `No user found with the email ${input.email}`,
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    const resetToken = signToken(payload); // Generate reset token

    // Send email to user with reset token
    await sendMailToResetPassword(
      user,
      `${process.env.BACK_END_URL}/user/resetpassword-verification?token=${resetToken}`,
    );

    return { message: 'Password reset link sent to your email' };
  }

  async resetPassword(
    input: UserDtos.ResetPasswordDto,
  ): Promise<{ message: string }> {
    const decodedToken = tokenDecoder(input.token); // Decode the token
    const user = await this.getUserById(decodedToken.id); // Get the user by decoded token's ID

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash the new password
    const hashedPassword = await hashPassword(input.newPassword);

    // Update user's password and clear the reset token
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password reset successful' };
  }
  async changePassword(
    input: UserDtos.ChangePasswordDto,
    currentUser: CommonDTOs.CurrentUser,
  ): Promise<{ message: string }> {
    const transactionScop = this.getTransactionScope();
    const user = await this.getUserById(currentUser.id);
    if (!user) {
      throw new InValidCredentials('Invalid user specified');
    }
    const isPasswordValid = await verifyPassword(
      input.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new InValidCredentials('Old password is incorrect');
    }
    const hashedPassword = await hashPassword(input.newPassword);
    user.password = hashedPassword;
    transactionScop.add(user);
    transactionScop.commit(this.entityManager);
    return { message: 'Password changed successfully' };
  }
}
