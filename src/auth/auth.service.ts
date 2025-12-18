import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import * as bcrypt from 'bcrypt';
import { Role } from './role.enum';
import { ParentsService } from '../parents/parents.service';
import { SignupParentDto } from './dto/signup-parent.dto';
import { SignupAdminDto } from '../admin/dto/signup-admin.dto';
import { CreateTeacherUserDto } from '../admin/dto/create-teacher-user.dto';
import { TeachersService } from '../teachers/teachers.service';
import { StaffService } from '../staff/staff.service';
import { CreateStaffUserDto } from '../admin/dto/create-staff-user.dto'; ;

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly parentsService: ParentsService,
        private readonly teachersService: TeachersService,
        private readonly staffService: StaffService, 
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

async login(user: any) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    parentId: user.parent?.id ?? null,
    teacherId: user.teacher?.id ?? null,
    staffId: user.staff?.id ?? null,
  };
  return {
    access_token: this.jwtService.sign(payload),
  };
}
    // 🔹 Inscription d'un parent : crée Parent + User + renvoie un token
    async signupParent(dto: SignupParentDto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new BadRequestException('Email already in use');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        // 1) Créer la famille (Parent) avec ton ParentsService
        const parent = await this.parentsService.create({
            fullName: dto.fullName,
            phone: dto.phone,
            email: dto.email,
        });

        // 2) Créer l'utilisateur lié à ce parent
        const user = await this.usersService.createUser(
            dto.email,
            passwordHash,
            Role.PARENT,
            parent,
        );

        // 3) Générer le JWT
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            parentId: parent.id,
        };

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                parentId: parent.id,
                familyCode: parent.familyCode,
            },
            access_token: this.jwtService.sign(payload),
        };

    }

    async signupAdmin(dto: SignupAdminDto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new BadRequestException('Email already in use');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        // pas de parent associé pour un admin
        const user = await this.usersService.createUser(
            dto.email,
            passwordHash,
            Role.ADMIN,
            null,
        );

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            parentId: null,
        };

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            access_token: this.jwtService.sign(payload),
        };
    }
    async createUserWithRole(email: string, password: string, role: Role) {
        const existing = await this.usersService.findByEmail(email);
        if (existing) {
            throw new BadRequestException('Email already in use');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await this.usersService.createUser(email, passwordHash, role, null);

        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }

    async createTeacherUserFromAdmin(dto: CreateTeacherUserDto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new BadRequestException('Email already in use');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        // 1) Créer le Teacher (profil métier)
        const teacher = await this.teachersService.create({
            fullName: dto.fullName,
            email: dto.email,
            phone: dto.phone,
            subjectIds: [],      // tu pourras associer les matières plus tard
            classGroupIds: [],   // idem pour les classes
        });

        // 2) Créer le User lié à ce Teacher
        const user = await this.usersService.createUser(
            dto.email,
            passwordHash,
            Role.TEACHER,
            null,
            teacher,
        );

        // On peut renvoyer juste le user + teacher
        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            teacher,
        };
    }

    async createStaffUserFromAdmin(dto: CreateStaffUserDto) {
  const existing = await this.usersService.findByEmail(dto.email);
  if (existing) {
    throw new BadRequestException('Email already in use');
  }

  const passwordHash = await bcrypt.hash(dto.password, 10);

  // 1) Créer le profil Staff
  const staff = await this.staffService.create(
    dto.fullName,
    dto.email,
    dto.phone,
    dto.roleLabel,
  );

  // 2) Créer l'utilisateur BENEVOL associé
  const user = await this.usersService.createUser(
    dto.email,
    passwordHash,
    Role.BENEVOL,
    null,
    null,
    staff,
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    staff,
  };
}

async hashPassword(plain: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(plain, saltRounds);
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  

}

