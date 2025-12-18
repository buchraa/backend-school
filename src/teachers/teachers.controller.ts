import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    ParseIntPipe,
    UseGuards,
    Req,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Teachers - Gestion des professeurs')
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) { }

    @Get('dashboard')
    @Roles(Role.ADMIN, Role.BENEVOL, Role.TEACHER)
    getMyTeacher(@Req() req) {
        return this.teachersService.getMyTeacherDashboard(req.user.teacherId);
    }



    // ADMIN & BENEVOL peuvent gérer les profs
    @Post()
    @Roles(Role.ADMIN, Role.BENEVOL)
    create(@Body() dto: CreateTeacherDto) {
        return this.teachersService.create(dto);
    }

    @Get('list-teachers')
    @Roles(Role.ADMIN, Role.BENEVOL)
    findAll() {
        return this.teachersService.findAll();
    }

    @Get('classes/:classId')
    @Roles(Role.ADMIN, Role.BENEVOL, Role.TEACHER)
    getMyClass(@Req() req, @Param('classId') classId: string) {
        return this.teachersService.getMyClassDetail(req.user.teacherId, +classId);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.BENEVOL, Role.TEACHER)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.teachersService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.BENEVOL)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTeacherDto,
    ) {
        return this.teachersService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.teachersService.remove(id);
    }
}
