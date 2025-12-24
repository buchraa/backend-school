import { Role } from '../../auth/role.enum';

export type ProfileType = 'PARENT' | 'TEACHER' | 'STAFF' | 'BENEVOL' | 'ADMIN' | null;

export class AdminUserDetailDto {
  id: number;
  email: string;
  role: Role;

  // pratique pour la liste + détails
  fullName: string | null;

  profileType: ProfileType;
  profileId: number | null;

  // profil détaillé (Parent/Teacher/Staff)
  profile: any | null;

  // optionnel si tu as ces colonnes
  createdAt?: Date;
  isActive?: boolean;
}
