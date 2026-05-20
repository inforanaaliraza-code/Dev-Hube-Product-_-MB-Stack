import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { seedSettings } from '../database/seeds/settings.seed';
import { SiteSettingEntity } from './entities/site-setting.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(SiteSettingEntity)
    private readonly settingsRepo: Repository<SiteSettingEntity>,
  ) {}

  async onModuleInit() {
    await seedSettings(this.settingsRepo);
  }

  async getAll() {
    const rows = await this.settingsRepo.find({ order: { key: 'ASC' } });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async upsert(key: string, value: Record<string, unknown>, user?: UserEntity | null) {
    let row = await this.settingsRepo.findOne({ where: { key } });
    if (!row) {
      row = this.settingsRepo.create({ key, value });
    } else {
      row.value = value;
    }
    row.updatedByUserId = user?.id ?? null;
    return this.settingsRepo.save(row);
  }
}
