import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  async seedRoles() {
    const defaultRoles = ['user', 'admin'];
    for (const roleName of defaultRoles) {
      const exists = await this.rolesRepository.findOne({ where: { name: roleName } });
      if (!exists) {
        const role = this.rolesRepository.create({ name: roleName, description: `Default ${roleName} role` });
        await this.rolesRepository.save(role);
        console.log(`Seeded role: ${roleName}`);
      }
    }
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { name } });
  }
}
