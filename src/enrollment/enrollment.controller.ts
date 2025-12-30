import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    UseGuards,
    Req,
    Param,
    Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentStatus } from './entities/enrollment-request.entity';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Enrollments - Gestion des inscriptions')
@Controller('enrollments')
export class EnrollmentController {
    constructor(private service: EnrollmentService) { }

    @Post('public')
    createPublic(@Body() dto: any) {
        return this.service.createPublicEnrollment(dto);
    }
    @Get('admin/children')
    @Roles(Role.ADMIN, Role.BENEVOL, Role.STAFF)
    listChildren(@Query('search') q = '') {
        return this.service.searchEnrollmentChildren(q);
    }

    /*@Post('children/:childId/assign/:groupId')
    @Roles(Role.ADMIN, Role.BENEVOL) // comme tu veux
    assignChildToGroup(
      @Param('childId', ParseIntPipe) childId: number,
      @Param('groupId', ParseIntPipe) groupId: number
    ) {
      return this.service.assignChildToGroup(childId, groupId);
    }*/
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PARENT)
    @Post('start')
    start(@Req() req) {
        return this.service.startEnrollmentForParent(req.user.parentId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PARENT)
    @Get('current')
    getMyEnrollment(@Req() req) {
        return this.service.getCurrentEnrollment(req.user.parentId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PARENT)
    @Patch('update')
    update(@Req() req, @Body() dto: UpdateEnrollmentDto) {
        console.log(dto);
        return this.service.updateEnrollment(req.user.parentId, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: EnrollmentStatus,
    ) {
        return this.service.updateStatus(+id, status);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF, Role.PARENT)
    @Get('request/:id')
    getOne(@Param('id') id: string) {
        return this.service.getRequestById(+id);
    }

}
