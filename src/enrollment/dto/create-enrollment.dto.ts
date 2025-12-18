export class CreatePublicEnrollmentDto {
  parent: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  };

  children: Array<{
    firstName: string;
    lastName: string;
    birthDate: string;
    desiredLevel: string;
    notes?: string;
  }>;
}
