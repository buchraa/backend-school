import { Controller, Post, Body, UseGuards, Get, Patch, Param } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { CreateTeacherUserDto } from './dto/create-teacher-user.dto';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UsersService } from 'src/users/users.service';
import { ParentsService } from 'src/parents/parents.service';
import { CreateParentDto } from 'src/parents/dto/create-parent.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { SchoolYearService } from 'src/schoolYear/schoolYear.service';

@ApiTags('Amin - Gestion des utilisateurs')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // tout le controller est réservé aux ADMIN
export class AdminUsersController {
    constructor(private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly parentsService: ParentsService,
        private readonly svc: AdminDashboardService,
        private readonly schoolService: SchoolYearService
    ) { }

@Get('school-year/active')
  getActive() {
    return this.schoolService.getActiveYear();
  }

    @Get('school-year')
    findAllSchoolYears() {
        return this.schoolService.findAll();
    }

    @Post('school-year')
    createYear(@Body('label') label: string) {
        return this.schoolService.create(label);
    }

    @Patch('school-year/:id/activate')
    activate(@Param('id') id: number) {
        return this.schoolService.activate(+id);
    }

    @Get('list-users')
    findAllUsers() {
        return this.usersService.listForAdmin();
    }

    @Post('parent')
    create(@Body() dto: CreateParentDto) {
        return this.parentsService.createParent(dto);
    }
    // 👉 créer un autre ADMIN
    @Post('admin')
    createAdmin(@Body() dto: CreateAdminUserDto) {
        return this.authService.createUserWithRole(dto.email, dto.password, Role.ADMIN);
    }

    // 👉 créer un GESTIONNAIRE / BÉNÉVOLE
    //@Post('gestionnaire')
    //createGestionnaire(@Body() dto: CreateAdminUserDto) {
    //return this.authService.createUserWithRole(dto.email, dto.password, Role.BENEVOL);
    //}

    @Post('teacher')
    createTeacher(@Body() dto: CreateTeacherUserDto) {
        return this.authService.createTeacherUserFromAdmin(dto);
    }

    @Post('gestionnaire')
    createStaff(@Body() dto: CreateStaffUserDto) {
        return this.authService.createStaffUserFromAdmin(dto);
    }
    @Get('kpis')
    getKpis() {
        return this.svc.getKpis();
    }

    @Get('recent-enrollments')
    getRecentEnrollments() {
        return this.svc.getRecentEnrollments();
    }

        @Get('all-enrollments')
    getAllEnrollments() {
        return this.svc.getAllEnrollments();
    }

    @Get('alerts')
    getAlerts() {
        return this.svc.getAlerts();
    }


}
