import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: { role: true } });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      relations: { role: true },
      select: [
        'user_id',
        'email',
        'password_hash',
        'user_status',
        'role_id',
        'email_verified',
        'email_verification_code',
        'email_verification_expires_at',
        'refresh_token_hash',
        'refresh_token_expires_at',
      ],
    });
  }

  async findOneById(user_id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { user_id } });
  }

  async findOneByIdWithSecrets(user_id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { user_id },
      relations: { role: true },
      select: [
        'user_id',
        'email',
        'password_hash',
        'user_status',
        'role_id',
        'email_verified',
        'refresh_token_hash',
        'refresh_token_expires_at',
        'email_verification_code',
        'email_verification_expires_at',
      ],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async createWithPassword(userData: Partial<User> & { password?: string }): Promise<User> {
    const { password, ...rest } = userData;
    const finalData = { ...rest } as Partial<User>;
    
    if (password) {
      const salt = await bcrypt.genSalt();
      finalData.password_hash = await bcrypt.hash(password, salt);
    }
    
    const user = this.usersRepository.create(finalData);
    return this.usersRepository.save(user);
  }

  async update(user_id: string, data: Partial<User>): Promise<void> {
    await this.usersRepository.update(user_id, data);
  }

  async updateRefreshToken(
    user_id: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.usersRepository.update(user_id, {
      refresh_token_hash: refreshTokenHash,
      refresh_token_expires_at: expiresAt,
    });
  }

  async clearRefreshToken(user_id: string): Promise<void> {
    await this.usersRepository.update(user_id, {
      refresh_token_hash: undefined,
      refresh_token_expires_at: undefined,
    });
  }

  async saveVerificationCode(
    user_id: string,
    code: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.usersRepository.update(user_id, {
      email_verification_code: code,
      email_verification_expires_at: expiresAt,
      email_verified: false,
    });
  }

  async markEmailVerified(user_id: string): Promise<void> {
    await this.usersRepository.update(user_id, {
      email_verified: true,
    });
  }

  async remove(user_id: string): Promise<void> {
    await this.usersRepository.delete(user_id);
  }
}
