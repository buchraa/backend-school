import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../auth/role.enum';
import { Parent } from '../parents/entities/parent.entity';
import { Teacher } from 'src/teachers/entities/teacher.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/update-user.dto';
import { AdminUserDetailDto, ProfileType } from './dto/admin-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,

    @InjectRepository(Parent)
    private readonly parentsRepo: Repository<Parent>,

    @InjectRepository(Teacher)
    private readonly teachersRepo: Repository<Teacher>,
    
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }



async list() {
  return this.usersRepo.find({
    select: ['id', 'email', 'role'],
    order: { id: 'DESC' },
  });
}

async listForAdmin() {
  const users = await this.usersRepo.find({
    relations: ['parent', 'teacher', 'staff'],
    order: { id: 'DESC' },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    fullName:
      u.parent?.fullName ??
      u.teacher?.fullName ??
      u.staff?.fullName ??
      null,
  }));
}

  async createUser(
  email: string,
  passwordHash: string,
  role: Role,
  parent?: Parent | null,
  teacher?: Teacher | null,
  staff?: Staff | null,
) {
  const user = this.usersRepo.create({
    email,
    passwordHash,
    role,
    parent: parent ?? null,
    teacher: teacher ?? null,
    staff: staff ?? null,
  });
  return this.usersRepo.save(user);
}

async update(id: number, dto: UpdateUserDto) {
  const user = await this.usersRepo.findOne({ where: { id } });
  if (!user) throw new NotFoundException('User not found');

  if (dto.password) {
    user.passwordHash = await bcrypt.hash(dto.password, 10);
    delete (dto as any).password;
  }

  Object.assign(user, dto);
  return this.usersRepo.save(user);
}

async remove(id: number) {
  await this.usersRepo.delete(id);
  return { ok: true };
}

async getUserById(id: number): Promise<AdminUserDetailDto> {
    const user = await this.usersRepo.findOne({
      where: { id },
      // ✅ si tes relations ne sont PAS eager, garde ça :
      relations: ['parent', 'teacher', 'staff'],
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    // ---- déterminer le profil "métier"
    let profileType: ProfileType = null;
    let profileId: number | null = null;
    let profile: any | null = null;

    if (user.parent) {
      profileType = 'PARENT';
      profileId = user.parent.id;
      profile = user.parent;
    } else if (user.teacher) {
      profileType = 'TEACHER';
      profileId = user.teacher.id;
      profile = user.teacher;
    } else if (user.staff) {
      // si tu distingues STAFF vs BENEVOL via role
      profileType = user.role === Role.BENEVOL ? 'BENEVOL' : 'STAFF';
      profileId = user.staff.id;
      profile = user.staff;
    } else {
      // ex: ADMIN sans profil métier lié
      profileType = user.role === Role.ADMIN ? 'ADMIN' : null;
      profileId = null;
      profile = null;
    }

    const fullName =
      (profile?.fullName as string | undefined) ??
      null;

    // ✅ On NE renvoie PAS passwordHash
    const dto: AdminUserDetailDto = {
      id: user.id,
      email: user.email,
      role: user.role,

      fullName,

      profileType,
      profileId,
      profile,

      // si tu as ces champs, sinon enlève
      // createdAt: (user as any).createdAt,
      // isActive: (user as any).isActive,
    };

    return dto;
  }

}

