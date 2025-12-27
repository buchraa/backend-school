// src/parents/parents.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Parents - Gestion des parents')
@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  findAll() {
    return this.parentsService.findAll();
  }

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT) // tout le controller est réservé aux ADMIN
    @Get('me')
  getMe(@Req() req) {
    const parentId = req.user.parentId;
    if (!parentId) {
      console.log('Parent ID not found in request:', req.user);
      throw new ForbiddenException('Utilisateur non rattaché à un parent');
    }
    return this.parentsService.findOne(parentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parentsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateParentDto) {
    return this.parentsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParentDto,
  ) {
    return this.parentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parentsService.remove(id);
  }
}
