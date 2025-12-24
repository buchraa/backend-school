import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/auth/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin - Gestion des utilisateurs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF, Role.BENEVOL)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list() {
    return this.usersService.list();
  }

@Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
