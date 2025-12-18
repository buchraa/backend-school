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
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2); // ex: "25"

  // Compter combien de parents ont déjà un code de cette année
  const count = await this.parentsRepo.count({
    where: {
      familyCode: Like(`F${yearSuffix}-%`)
    }
  });

  // Le prochain numéro, +1
  const nextNumber = count + 1;

  // Format sur 3 chiffres => "001", "023", etc.
  const paddedNumber = nextNumber.toString().padStart(3, '0');

  return `F${yearSuffix}-${paddedNumber}`;
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
