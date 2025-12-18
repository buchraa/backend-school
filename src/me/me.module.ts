// src/me/me.module.ts
import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { BillingModule } from '../billing/billing.module';
import { TeachersModule } from '../teachers/teachers.module';

@Module({
  imports: [BillingModule, TeachersModule],
  controllers: [MeController],
})
export class MeModule {}
