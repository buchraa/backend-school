import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

// password-reset-token.entity.ts
@Entity()
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  userId: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
