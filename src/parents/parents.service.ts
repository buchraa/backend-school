// src/parents/parents.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from './entities/parent.entity';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { Like } from 'typeorm';


@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentsRepo: Repository<Parent>,
  ) {}

  findById(id: number) {
    return this.parentsRepo.findOne({ where: { id }, relations: ['children'] });
  }

  findByEmail(email: string) {
    return this.parentsRepo.findOne({ where: { email } });
  }

  create(data: Partial<Parent>) {
    return this.parentsRepo.save(data);
  }

  findAll(): Promise<Parent[]> {
    return this.parentsRepo.find({
      relations: ['children'],
    });
  }

private async generateFamilyCode(): Promise<string> {
  const yearSuffix = String(new Date().getFullYear()).slice(-2); // "25"
  const prefix = `F${yearSuffix}-`;

  const last = await this.parentsRepo.findOne({
    where: { familyCode: Like(`${prefix}%`) },
    select: { familyCode: true },
    order: { familyCode: 'DESC' }, // <-- CRUCIAL
  });

  const lastNum = last?.familyCode
    ? Number(last.familyCode.replace(prefix, ''))
    : 0;

  const nextNum = lastNum + 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`; // F25-001
}


  async findOne(id: number): Promise<Parent> {
    const parent = await this.parentsRepo.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!parent) {
      throw new NotFoundException(`Parent #${id} not found`);
    }
    return parent;
  }

async createParent(dto: CreateParentDto): Promise<Parent> {
  let familyCode = await this.generateFamilyCode();

  // Sécurité contre collision improbable
  while (await this.parentsRepo.findOne({ where: { familyCode } })) {
    familyCode = await this.generateFamilyCode();
  }

  const parent = this.parentsRepo.create({
    ...dto,
    familyCode,
  });

  return this.parentsRepo.save(parent);
}



  async update(id: number, dto: UpdateParentDto): Promise<Parent> {
    const parent = await this.findOne(id);
    Object.assign(parent, dto);
    return this.parentsRepo.save(parent);
  }

  async remove(id: number): Promise<void> {
    const parent = await this.findOne(id);
    await this.parentsRepo.remove(parent);
  }
}
