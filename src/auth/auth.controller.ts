import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupParentDto } from './dto/signup-parent.dto';
import { SignupAdminDto } from 'src/admin/dto/signup-admin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ParentSignupDto } from './dto/parent-signup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);

  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @Post('signup-family')
  signupWithCode(@Body() dto: ParentSignupDto) {
    return this.authService.parentSignup(dto);
  }

  @Post('signup-parent')
  async signupParent(@Body() dto: SignupParentDto) {
    return this.authService.signupParent(dto);
  }

  // 🔹 EndPoint pour créer le premier ADMIN
  @Post('signup-admin')
  async signupAdmin(@Body() dto: SignupAdminDto) {
    return this.authService.signupAdmin(dto);
  }

  // 🔹 EndPoint pour créer le premier ADMIN
  @UseGuards(JwtAuthGuard)
  @Get('whoami')
  async whoiam(@Req() req: any) {
    const user = req.user;
    return {
      iserId: user.id,
      email: user.email,
      role: user.role,
      teacherId: user.teacherId,
      staffId: user.staffId,
      parent: user.parent ? { id: user.parentId, familyCode: user.familyCode, fullName: user.parent.fullName } : null,
    };
  }

}
