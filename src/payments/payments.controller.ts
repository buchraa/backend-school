// src/payments/payments.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { ImportBankDto } from './dto/import-bank.dto';
import { EnrollmentService } from '../enrollment/enrollment.service';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService, private service: EnrollmentService) {}

  @Get()
  @Roles(Role.ADMIN, Role.BENEVOL)
  findAll() {
    return this.paymentsService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN, Role.BENEVOL)
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get('family')
  @Roles(Role.ADMIN, Role.BENEVOL, Role.PARENT)
  findByFamily(@Req() req) {
    return this.paymentsService.findByFamilyCode(req.user.parentId);
  }

  @Post('import-bank')
@Roles(Role.ADMIN, Role.BENEVOL)
importBank(@Body() dto: ImportBankDto) {
  return this.paymentsService.importBankLines(dto);
}


@Get('me')
  getMyPayments(@Req() req) {
    const familyCode = req.user.parent?.familyCode;
    return this.paymentsService.findByFamilyCode(familyCode);
  }



  @Get('enrollments')
 @Roles(Role.ADMIN, Role.BENEVOL, Role.PARENT)
  getMyEnrollments(@Req() req) {
    const parentId = req.user.parent?.id;
    return this.service.getCurrentEnrollment(parentId);
  }
}

