import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.userService.create(registerDto);
    const payload = { sub: user.id, email: user.email, role: user.role };
    const userDetails = { ...user };
    delete (userDetails as { password?: unknown }).password;

    return {
      access_token: this.jwtService.sign(payload),
      user: userDetails,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const userDetails = { ...user };
    delete (userDetails as { password?: unknown }).password;

    return {
      access_token: this.jwtService.sign(payload),
      user: userDetails,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException();
    const result = { ...user };
    delete (result as { password?: unknown }).password;
    return result;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userService.updateProfile(userId, updateProfileDto);
    // const { password, ...result } = user;
    const result = { ...user };
    delete (result as { password?: unknown }).password;

    return result;
  }

  async deleteUser(userId: string) {
    await this.userService.deleteUser(userId);
    return { message: 'User deleted successfully' };
  }
}
