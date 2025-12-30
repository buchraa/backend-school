import * as XLSX from 'xlsx';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Parent } from '../entities/parent.entity';
import { Student } from '../../students/entities/student.entity';
import * as path from 'path';

@Injectable()
export class ImportParentsService {
    constructor(
        @InjectRepository(Parent)
        private parentRepo: Repository<Parent>,

        @InjectRepository(Student)
        private studentRepo: Repository<Student>,
    ) { }

    normKey(k: string): string {
        return k
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève accents
            .trim()
            .toLowerCase();
    }

    getCell(row: any, key: string): any {
        const target = this.normKey(key);
        const found = Object.keys(row).find(k => this.normKey(k) === target);
        return found ? row[found] : undefined;
    }

private async generateFamilyCode(): Promise<string> {
  const yearSuffix = String(new Date().getFullYear()).slice(-2); // "25"
  const prefix = `F${yearSuffix}-`;

  const last = await this.parentRepo.findOne({
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

    private generateRef(familyCode: string, index: number): string {
    // index = 0 → A, 1 → B, 2 → C, ...
    const baseCharCode = 'A'.charCodeAt(0);
    const letter = String.fromCharCode(baseCharCode + index);
    return `${familyCode}${letter}`;
  }

  /** Si ton Excel contient "Élèves" avec plusieurs élèves dans la même cellule */
  private splitEleves(eleveRaw: string): string[] {
    const s = (eleveRaw ?? '').toString().trim();
    if (!s) return [];

    // séparateurs possibles: "\n", ",", ";", "/"
    return s
      .split(/[\n,;/]+/g)
      .map((x) => x.trim())
      .filter(Boolean);
  }

    /** Supprime le dernier token si c'est du type "6C", "1B", "10A"... */
  private cleanStudentName(raw: string): string {
    const s = (raw ?? '').toString().trim().replace(/\s+/g, ' ');
    if (!s) return '';

    const parts = s.split(' ');
    const last = parts[parts.length - 1];

    // match: 1A, 6C, 10B, 3D, etc.
    if (/^\d{1,2}[A-Za-z]$/i.test(last) || /^\d{1,2}[A-Za-z]{1,3}$/i.test(last)) {
      parts.pop();
    }
    return parts.join(' ').trim();
  }


async importFromExcel(filePath: string) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows: Array<{
    ParentID: any;
    Parents: any;
    Élèves: any;
    Contact: any;
  }> = XLSX.utils.sheet_to_json(sheet, {
    header: ['ParentID', 'Parents', 'Élèves', 'Contact'],
    range: 1,     // saute la ligne des titres
    defval: '',   // pas de undefined
  });

  let currentFamilyCode = '';
  let currentParentName = '';
  let currentPhone: string | undefined;

  let parentsCreated = 0;
  let studentsCreated = 0;
  let studentsSkipped = 0;

  for (const row of rows) {
    // 1) Propagation des infos parent
    const parentIdCell = String(row.ParentID ?? '').trim();
    const parentNameCell = String(row.Parents ?? '').trim();
    const contactCell = String(row.Contact ?? '').trim();

   if (parentIdCell) currentFamilyCode =  await this.generateFamilyCode();
    if (parentNameCell) currentParentName = parentNameCell;
    if (contactCell) currentPhone = contactCell || undefined;

    // 2) Élève (toujours 1 par ligne)
    const eleveRaw = String(row.Élèves ?? '').trim();
    if (!currentFamilyCode || !currentParentName || !eleveRaw) continue;

    const eleveName = this.cleanStudentName(eleveRaw);
    if (!eleveName) continue;

    // 3) Upsert parent
    let parent = await this.parentRepo.findOne({
      where: { familyCode: currentFamilyCode },
    });

    if (!parent) {
      parent = this.parentRepo.create({
        familyCode: currentFamilyCode,
        fullName: currentParentName,
        phone: currentPhone,
        email: undefined,
      });
      parent = await this.parentRepo.save(parent);
      parentsCreated++;
    }

    // 4) Eviter doublon élève pour ce parent
    const exists = await this.studentRepo.findOne({
      where: { fullName: eleveName, parent: { id: parent.id } },
      relations: { parent: true },
    });
    if (exists) {
      studentsSkipped++;
      continue;
    }

    // 5) studentRef = (nb d'enfants déjà en base pour ce parent) -> A, B, C...
    const count = await this.studentRepo.count({
      where: { parent: { id: parent.id } },
      relations: { parent: true },
    });
    const studentRef = this.generateRef(parent.familyCode, count);

    const student = this.studentRepo.create({
      fullName: eleveName,
      studentRef,
      parent,
      classGroup: null,
    });

    await this.studentRepo.save(student);
    studentsCreated++;
  }

  return { success: true, parentsCreated, studentsCreated, studentsSkipped };
}




/*
async importFromExcel(filePath: string) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows: any = XLSX.utils.sheet_to_json(sheet, {
    header: ['ParentID', 'Parents', 'Élèves', 'Contact'],
    range: 1,
    defval: '',
  });

  console.log('Rows count =', rows.length);
  console.log('Sample row =', rows[0]);

  let parentsCreated = 0;
  let studentsCreated = 0;

  for (const row of rows) {
      let familyCode = await this.generateFamilyCode();


    const parentName = String(row.Parents).trim();
    const phone = String(row.Contact).trim();
    const eleveRaw = String(row['Élèves']).trim();

    if (!familyCode || !parentName || !eleveRaw) continue;

    let parent = await this.parentRepo.findOne({
      where: { familyCode },
    });

    if (!parent) {
      parent = this.parentRepo.create({
        familyCode,
        fullName: parentName,
        phone: phone || undefined,
        email: undefined,
      });
      await this.parentRepo.save(parent);
      parentsCreated++;
    }
    // Nombre d’enfants déjà enregistrés pour cette famille
    const existingChildrenCount = parent.children ? parent.children.length : 0;
    // Génération de la ref : familyCode + lettre
    const studentRef = this.generateRef(parent.familyCode, existingChildrenCount);


const eleves = this.splitEleves(eleveRaw);

    for (const eleveText of eleves) {
      // ⚠️ IMPORTANT : éviter doublon élève pour un même parent
      const exists = await this.studentRepo.findOne({
        where: { fullName: eleveText, parent: { id: parent.id } },
        relations: { parent: true },
      });

      if (exists) continue;

      const student = this.studentRepo.create({
        fullName: eleveText,
        studentRef: studentRef,     // si tu le génères ailleurs, sinon tu peux le générer ici
        parent,
        classGroup: null,
      });

      await this.studentRepo.save(student);
    }


  }

  return {
    success: true,
    rows: rows.length,
    parentsCreated,
    studentsCreated,
  };
}*/


}
