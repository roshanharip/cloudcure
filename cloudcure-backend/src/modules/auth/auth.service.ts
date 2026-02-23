import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role } from '@common/enums/role.enum';

interface UserWithId extends User {
  _id: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserWithId | null> {
    const user: UserDocument | null =
      await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password || ''))) {
      const userObj = user.toObject() as UserWithId;
      return userObj;
    }
    return null;
  }

  async validateOAuthUser(details: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<UserWithId> {
    const user = await this.usersService.findOneByEmail(details.email);
    if (user) {
      const userObj = user.toObject() as UserWithId;
      return userObj;
    }
    // Create new user if not exists
    const newUser = await this.usersService.create({
      email: details.email,
      name: `${details.firstName} ${details.lastName}`,
      password: await bcrypt.hash(Math.random().toString(36), 10),
      role: Role.PATIENT,
      isActive: true,
    } as CreateUserDto);

    const newUserObj = newUser.toObject() as UserWithId;
    return newUserObj;
  }

  async getTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async login(user: UserWithId) {
    const tokens = await this.getTokens(
      user._id.toString(),
      user.email,
      user.role,
    );
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken, // For cookie setting
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { refreshToken: null });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access Denied');

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) throw new UnauthorizedException('Access Denied');

    const tokens = await this.getTokens(
      user._id.toString(),
      user.email,
      user.role,
    );
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }
}
