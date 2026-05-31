import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { seedPlugins } from '../database/seeds/plugins.seed';
import { CreatePluginDto } from './dto/create-plugin.dto';
import { UpdatePluginDto } from './dto/update-plugin.dto';
import {
  PluginEntity,
  PluginStatus,
  PluginType,
} from './entities/plugin.entity';

@Injectable()
export class PluginsService implements OnModuleInit {
  constructor(
    @InjectRepository(PluginEntity)
    private readonly repo: Repository<PluginEntity>,
  ) {}

  async onModuleInit() {
    await seedPlugins(this.repo);
  }

  async findAll(type?: PluginType) {
    const rows = await this.repo.find({
      where: type ? { type } : undefined,
      order: { name: 'ASC' },
    });
    return rows.map((r) => this.toResponse(r));
  }

  async findOne(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Plugin not found');
    return this.toResponse(row);
  }

  async create(dto: CreatePluginDto) {
    const slug = this.normalizeSlug(dto.slug);
    const exists = await this.repo.findOne({ where: { slug } });
    if (exists) throw new ConflictException('Plugin slug already exists');
    const row = await this.repo.save(
      this.repo.create({
        slug,
        name: dto.name,
        description: dto.description ?? '',
        version: dto.version ?? '1.0.0',
        type: dto.type,
        status: dto.status ?? PluginStatus.INACTIVE,
        category: dto.category ?? 'general',
        adminPath: dto.adminPath ?? null,
        isSystem: false,
      }),
    );
    return this.toResponse(row);
  }

  async update(id: string, dto: UpdatePluginDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Plugin not found');
    if (dto.slug !== undefined) {
      const slug = this.normalizeSlug(dto.slug);
      if (slug !== row.slug) {
        const clash = await this.repo.findOne({ where: { slug } });
        if (clash) throw new ConflictException('Plugin slug already exists');
        row.slug = slug;
      }
    }
    if (dto.name !== undefined) row.name = dto.name;
    if (dto.description !== undefined) row.description = dto.description;
    if (dto.version !== undefined) row.version = dto.version;
    if (dto.type !== undefined) row.type = dto.type;
    if (dto.status !== undefined) row.status = dto.status;
    if (dto.category !== undefined) row.category = dto.category;
    if (dto.adminPath !== undefined) row.adminPath = dto.adminPath;
    const saved = await this.repo.save(row);
    return this.toResponse(saved);
  }

  async remove(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Plugin not found');
    if (row.isSystem) {
      throw new ConflictException('System plugins cannot be deleted');
    }
    await this.repo.remove(row);
  }

  async bulk(ids: string[], action: 'delete' | 'setStatus', status?: PluginStatus) {
    const unique = [...new Set(ids)];
    let affected = 0;
    const errors: string[] = [];

    for (const id of unique) {
      try {
        if (action === 'delete') {
          await this.remove(id);
          affected += 1;
        } else if (action === 'setStatus' && status) {
          await this.update(id, { status });
          affected += 1;
        }
      } catch {
        errors.push(id);
      }
    }

    return { affected, failed: errors.length, errors };
  }

  private normalizeSlug(slug: string) {
    return slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private toResponse(row: PluginEntity) {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      version: row.version,
      type: row.type,
      status: row.status,
      category: row.category,
      adminPath: row.adminPath,
      isSystem: row.isSystem,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
