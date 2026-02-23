import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  UnauthorizedException,
  Get,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '@common/guards/jwt-refresh.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import type { Request as ExpressRequest, Response } from 'express';
import { User } from '../users/schemas/user.schema';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user and return access token with HttpOnly refresh token cookie',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const authResponse = await this.authService.login(user);
    res.cookie('Refresh-Token', authResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken: authResponse.accessToken, user: authResponse.user };
  }

  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description: 'Create new user account with password confirmation',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or email already exists',
  })
  async register(@Body() registerDto: RegisterDto): Promise<any> {
    const user = await this.authService.register(registerDto);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidate refresh token and clear cookie',
  })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<null> {
    await this.authService.logout(req.user.sub);
    res.clearCookie('Refresh-Token');
    return null;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates the Google OAuth2 flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handles Google OAuth2 authentication callback',
  })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  async googleAuthRedirect(
    @Request() req: ExpressRequest & { user: User & { _id: string } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.login(req.user);
    res.cookie('Refresh-Token', authResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken: authResponse.accessToken, user: authResponse.user };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token from cookie',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Request()
    req: ExpressRequest & { user: JwtPayload & { refreshToken: string } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    const authResponse = await this.authService.refreshTokens(
      userId,
      refreshToken,
    );

    res.cookie('Refresh-Token', authResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken: authResponse.accessToken, user: authResponse.user };
  }
}
