import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SchoolYear } from "./entities/school-year.entity";

@Injectable()
export class SchoolYearService {
  constructor(
    @InjectRepository(SchoolYear)
    private readonly repo: Repository<SchoolYear>,
  ) {}

  // 🔹 utilisée partout (enrollment, paiements…)
  async getActiveYear() {
    return this.repo.findOne({ where: { isActive: true } });
  }

  // 🔹 admin
  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(label: string) {
    const year = this.repo.create({ label });
    return this.repo.save(year);
  }

  async activate(id: number) {
    // désactiver toutes les autres
    await this.repo.update({ isActive: true }, { isActive: false });

    // activer celle-ci
    await this.repo.update(id, { isActive: true });

    return { ok: true };
  }
}
