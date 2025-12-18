import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

  async create(fullName: string, email?: string, phone?: string, roleLabel?: string) {
    const staff = this.staffRepo.create({ fullName, email, phone, roleLabel });
    return this.staffRepo.save(staff);
  }
}
