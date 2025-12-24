// src/classes/classes.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { AssignTeachersDto } from './dto/assign-teachers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Classes - Gestion des classes')
@Controller('/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.BENEVOL)
  create(@Body() dto: CreateClassGroupDto) {
    return this.classesService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.BENEVOL, Role.TEACHER)
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.BENEVOL, Role.TEACHER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(id);
  }
    @Delete('class-groups/:id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.remove(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.BENEVOL)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassGroupDto,
  ) {
    return this.classesService.update(id, dto);
  }



  // Affecter des enfants (EnrollmentChild) à un groupe
  @Post(':id/assign-child')
  async assignChildToGroup(
    @Param('id', ParseIntPipe) classId: number,
    @Body() dto: AssignStudentsDto,
  ) {
    return this.classesService.assignChildrenToGroup(classId, dto.childIds);
  }

  // ✅ Affecter des enseignants à un groupe
  @Post(':id/teachers')
  assignTeachers(@Param('id') id: string, @Body() dto: AssignTeachersDto) {
    return this.classesService.assignTeachers(+id, dto);
  }

  @Delete('class-groups/:groupId/students/:studentId')
  removeStudentFromGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.classesService.removeStudentFromGroup(groupId, studentId);
  }
}
