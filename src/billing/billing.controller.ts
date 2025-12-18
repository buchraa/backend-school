import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
  Req
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { FakeAuthGuard } from '../auth/fake-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Billing - Gestion de la facturation')

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard) // applique à tout le controller
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('generate')
  @Roles(Role.ADMIN, Role.BENEVOL)
  generate(@Body() body: { year: number; month: number }) {
    return this.billingService.generateForMonth(body.year, body.month);
  }

  @Get('status')
  @Roles(Role.ADMIN, Role.BENEVOL)
  getStatus(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.billingService.getStatusForMonth(year, month);
  }

  @Get('overdue')
  @Roles(Role.ADMIN, Role.BENEVOL)
  getOverdue(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.billingService.getOverdueForMonth(year, month);
  }

  @Get('family/:parentId')
  @Roles(Role.ADMIN, Role.BENEVOL, Role.PARENT) // ex: plus tard on pourra restreindre à la famille connectée
  getFamilyBilling(
    @Param('parentId') parentId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.billingService.getFamilyBilling(parentId, year, month);
  }

  /**
   * Renvoie toute la facturation de la famille du parent connecté
   * GET /me/family-billing
   */
  @Get('me/family-billing')
  @Roles(Role.PARENT)
  async getMyFamilyBilling(@Req() req: any) {
    const parentId = req.user.parentId;

    if (!parentId) {
      throw new ForbiddenException(
        'No family linked to this user (no parentId in token)',
      );
    }

    return this.billingService.getFamilyHistoryForParent(parentId);
  }
}

