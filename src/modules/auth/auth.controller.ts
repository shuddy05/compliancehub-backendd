import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ValidationPipe,
  UseGuards,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { EmailVerificationToken } from '../../database/entities/email-verification-token.entity';
import { AuthService } from './services/auth.service';
import { EmailService } from '../email/services/email.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { TokenResponse } from './interfaces/jwt-payload.interface';
import * as crypto from 'crypto';

// Public guard that always allows access
class PublicGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerificationToken)
    private verificationTokenRepository: Repository<EmailVerificationToken>,
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
  ): Promise<any> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await this.authService.hashPassword(
      registerDto.password,
    );

    // Create user but don't mark as verified yet
    const user = this.userRepository.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      passwordHash: hashedPassword,
      isActive: true,
      emailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Valid for 24 hours

    const token = this.verificationTokenRepository.create({
      token: verificationToken,
      userId: savedUser.id,
      email: savedUser.email,
      expiresAt,
    });

    await this.verificationTokenRepository.save(token);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        savedUser.email,
        savedUser.firstName,
        verificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't delete user - email can be resent
      // Just log the error and continue
    }

    // Generate tokens for initial access (user still needs email verification)
    const tokens = this.authService.generateTokens(savedUser);

    return {
      ...tokens,
      message: 'Registration successful. Please check your email to verify your account.',
      email: savedUser.email,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !(await this.authService.comparePasswords(
      loginDto.password,
      user.passwordHash,
    ))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is not active');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // If user has 2FA enabled, return a short-lived MFA temp token instead of final tokens
    if (user.twoFactorEnabled) {
      const temp = this.authService.generateMfaToken(user);
      return { mfaRequired: true, tempToken: temp };
    }

    return this.authService.generateTokens(user);
  }

  @Post('mfa/login-verify')
  @HttpCode(HttpStatus.OK)
  async mfaLoginVerify(@Body() body: { tempToken: string; token: string }) {
    console.log('[MFA-FULL-DEBUG] incoming request:', JSON.stringify(body, null, 2));
    if (!body?.tempToken || !body?.token) {
      console.log('[MFA-ERROR] missing body fields:', { hasTempToken: !!body?.tempToken, hasToken: !!body?.token });
      throw new BadRequestException('tempToken and token are required');
    }
    const decoded = this.authService.validateMfaToken(body.tempToken);
    console.log('[MFA-DEBUG] decoded temp token:', decoded);
    if (!decoded) {
      console.log('[MFA-ERROR] temp token invalid or expired');
      throw new BadRequestException('Invalid or expired temp token');
    }

    const speakeasy = await import('speakeasy');
    const user = await this.userRepository.findOne({ where: { id: decoded.sub } });
    console.log('[MFA-DEBUG] user lookup:', { userId: user?.id, hasTotpSecret: !!user?.totpSecret });
    if (!user) throw new BadRequestException('User not found');
    if (!user.totpSecret) {
      console.log('[MFA-ERROR] user has no TOTP secret stored');
      throw new BadRequestException('MFA not configured for user');
    }

    console.log('[MFA-DEBUG] verifying TOTP with:', { tokenLength: body.token.length, secretLength: user.totpSecret.length });
    const valid = speakeasy.totp.verify({ secret: user.totpSecret, encoding: 'base32', token: body.token, window: 1 });
    console.log('[MFA-DEBUG] totp verify result:', valid);
    if (!valid) throw new BadRequestException('Invalid MFA token');

    // Return final access + refresh tokens
    return this.authService.generateTokens(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponse> {
    const payload = await this.authService.validateRefreshToken(
      refreshTokenDto.refreshToken,
    );

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['companyUsers', 'companyUsers.company'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.authService.generateTokens(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ message: string }> {
    // Token invalidation can be handled via JWT blacklisting in production
    return { message: 'Logged out successfully' };
  }

  @Get('verify-email')
  @UseGuards(PublicGuard)
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Query('token') token: string,
  ): Promise<{ message: string; tokens: TokenResponse }> {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    const verificationToken = await this.verificationTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    // Check if token has expired
    if (new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Verification token has expired');
    }

    // Check if token was already used
    if (verificationToken.used) {
      throw new BadRequestException('Verification token has already been used');
    }

    // Mark token as used and verify email
    verificationToken.used = true;
    await this.verificationTokenRepository.save(verificationToken);

    const user = verificationToken.user;
    user.emailVerified = true;
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate and return tokens
    const tokens = await this.authService.generateTokens(user);

    return {
      message: 'Email verified successfully',
      tokens,
    };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(
    @Body(ValidationPipe) body: { email: string },
  ): Promise<{ message: string }> {
    if (!body.email || !body.email.trim()) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.userRepository.findOne({
      where: { email: body.email.trim().toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Invalidate old tokens
    await this.verificationTokenRepository.update(
      { userId: user.id, used: false },
      { used: true },
    );

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const token = this.verificationTokenRepository.create({
      token: verificationToken,
      userId: user.id,
      email: user.email,
      expiresAt,
    });

    await this.verificationTokenRepository.save(token);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail - user can try again
    }

    return { message: 'Verification email resent successfully' };
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  async setupMfa(@GetUser() userPayload: any) {
    const speakeasy = await import('speakeasy');
    const user = await this.userRepository.findOne({ where: { id: userPayload.sub } });
    if (!user) throw new BadRequestException('User not found');

    const secret = speakeasy.generateSecret({ name: `ComplianceHub (${user.email})` });
    // store temp secret
    user.totpTempSecret = secret.base32;
    await this.userRepository.save(user);

    return { otpauth_url: secret.otpauth_url, base32: secret.base32 };
  }

  @Post('mfa/verify')
  @UseGuards(JwtAuthGuard)
  async verifyMfa(@GetUser() userPayload: any, @Body() body: { token: string }) {
    if (!body?.token) throw new BadRequestException('Token is required');
    const speakeasy = await import('speakeasy');
    const user = await this.userRepository.findOne({ where: { id: userPayload.sub } });
    if (!user) throw new BadRequestException('User not found');
    const secret = user.totpTempSecret || user.totpSecret;
    if (!secret) throw new BadRequestException('MFA not initialized');

    const valid = speakeasy.totp.verify({ secret, encoding: 'base32', token: body.token, window: 1 });
    if (!valid) throw new BadRequestException('Invalid MFA token');

    // Promote temp secret to permanent and enable 2FA
    if (user.totpTempSecret) {
      user.totpSecret = user.totpTempSecret;
      user.totpTempSecret = null;
    }
    user.twoFactorEnabled = true;
    await this.userRepository.save(user);

    return { ok: true };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetUser() userPayload: any,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    if (!body.currentPassword || !body.newPassword) {
      throw new BadRequestException('Current password and new password are required');
    }

    if (body.newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const user = await this.userRepository.findOne({
      where: { id: userPayload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.authService.comparePasswords(
      body.currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.authService.hashPassword(body.newPassword);

    // Update password
    user.passwordHash = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }
}
