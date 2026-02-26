import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('USERS')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  date_of_birth: Date;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  display_name: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  language_preference: string;

  @Column({ nullable: true })
  national_id: string;

  @Column({ default: false })
  national_id_verified: boolean;

  @Column({ nullable: true, select: false }) // Hide by default
  password_hash: string;

  @ManyToOne(() => Role, { eager: true }) // Eager load role
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ nullable: true })
  role_id: string;

  @Column({
    type: 'simple-enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  user_status: UserStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Accessor for Passport compatibility
  get password(): string {
    return this.password_hash;
  }
}
