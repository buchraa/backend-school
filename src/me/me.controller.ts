import { Controller, Get, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { TeachersService } from '../teachers/teachers.service';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeController {
  constructor(
    private readonly teachersService: TeachersService,
  ) {}



  @Get('teacher')
  @Roles(Role.TEACHER)
  async getMyTeacherProfile(@Req() req: any) {
    const teacherId = req.user.teacherId;
    if (!teacherId) {
      throw new ForbiddenException('No teacher profile linked to this user');
    }

    const teacher = await this.teachersService.findByIdWithRelations(teacherId);
    return teacher;
  }
}
