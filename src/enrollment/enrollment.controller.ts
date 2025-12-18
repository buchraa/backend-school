import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    UseGuards,
    Req,
    Param,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

import { RolesGuard } from 'src/auth/roles.guard';
import { CreatePublicEnrollmentDto } from './dto/create-enrollment.dto';
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
    @Roles(Role.ADMIN, Role.STAFF)
    @Get('request/:id')
    getOne(@Param('id') id: string) {
        return this.service.getRequestById(+id);
    }

}
