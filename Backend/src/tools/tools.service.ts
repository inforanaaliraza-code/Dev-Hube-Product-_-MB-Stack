import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { TOOL_CATEGORIES } from './data/categories';
import { seedTools } from '../database/seeds/tools.seed';
import { QueryToolsDto } from './dto/query-tools.dto';
import { ToolResponseDto } from './dto/tool-response.dto';
import { AuditService } from '../audit/audit.service';
import { UserEntity } from '../users/entities/user.entity';
import { ToolEntity } from './entities/tool.entity';
import { ToolBlogService } from './tool-blog.service';

@Injectable()
export class ToolsService implements OnModuleInit {
  constructor(
    @InjectRepository(ToolEntity)
    private readonly toolsRepo: Repository<ToolEntity>,
    private readonly auditService: AuditService,
    private readonly toolBlogService: ToolBlogService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    await seedTools(this.toolsRepo);
  }

  async findAll(query: QueryToolsDto): Promise<ToolResponseDto[]> {
    const qb = this.toolsRepo.createQueryBuilder('tool');

    if (query.category) {
      qb.andWhere('tool.category = :category', { category: query.category });
    }

    if (query.featured === true) {
      qb.andWhere('tool.featured = true');
    }

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere(
        '(tool.name ILIKE :term OR tool.tagline ILIKE :term OR tool.category ILIKE :term OR tool.description ILIKE :term)',
        { term },
      );
    }

    qb.orderBy('tool.name', 'ASC');
    const entities = await qb.getMany();
    return entities.map((e) => ToolResponseDto.fromEntity(e));
  }

  async findBySlug(slug: string): Promise<ToolResponseDto> {
    const entity = await this.toolsRepo.findOne({ where: { slug } });
    if (!entity) {
      throw new NotFoundException(`Tool "${slug}" not found`);
    }
    return ToolResponseDto.fromEntity(entity);
  }

  async getCategories() {
    const raw = await this.toolsRepo
      .createQueryBuilder('tool')
      .select('tool.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tool.category')
      .getRawMany<{ category: string; count: string }>();

    const counts = Object.fromEntries(
      raw.map((row) => [row.category, Number(row.count)]),
    );

    return {
      categories: TOOL_CATEGORIES,
      counts,
      total: await this.toolsRepo.count(),
    };
  }

  async create(dto: CreateToolDto, actor?: UserEntity | null): Promise<ToolResponseDto> {
    const exists = await this.toolsRepo.findOne({ where: { slug: dto.slug } });
    if (exists) {
      throw new ConflictException(`Tool slug "${dto.slug}" already exists`);
    }
    const entity = this.toolsRepo.create({
      ...dto,
      featured: dto.featured ?? false,
    });
    const saved = await this.toolsRepo.save(entity);
    await this.auditService.log(actor ?? null, 'tool.create', 'tool', saved.slug, {
      name: saved.name,
    });
    return ToolResponseDto.fromEntity(saved);
  }

  async update(
    slug: string,
    dto: UpdateToolDto,
    actor?: UserEntity | null,
  ): Promise<ToolResponseDto> {
    const entity = await this.toolsRepo.findOne({ where: { slug } });
    if (!entity) {
      throw new NotFoundException(`Tool "${slug}" not found`);
    }
    if (dto.slug && dto.slug !== slug) {
      const clash = await this.toolsRepo.findOne({ where: { slug: dto.slug } });
      if (clash) {
        throw new ConflictException(`Tool slug "${dto.slug}" already exists`);
      }
    }
    Object.assign(entity, dto);
    const saved = await this.toolsRepo.save(entity);
    await this.auditService.log(actor ?? null, 'tool.update', 'tool', saved.slug, {
      name: saved.name,
    });
    return ToolResponseDto.fromEntity(saved);
  }

  async bulk(
    slugs: string[],
    action: 'delete' | 'setStatus' | 'setFeatured',
    options: { status?: 'ready' | 'soon'; featured?: boolean },
    actor?: UserEntity | null,
  ) {
    const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
    let affected = 0;
    const errors: string[] = [];

    for (const slug of unique) {
      try {
        if (action === 'delete') {
          await this.remove(slug, actor);
          affected += 1;
        } else if (action === 'setStatus' && options.status) {
          await this.update(slug, { status: options.status }, actor);
          affected += 1;
        } else if (action === 'setFeatured' && options.featured !== undefined) {
          await this.update(slug, { featured: options.featured }, actor);
          affected += 1;
        }
      } catch {
        errors.push(slug);
      }
    }

    return { affected, failed: errors.length, errors };
  }

  async remove(slug: string, actor?: UserEntity | null): Promise<{ removed: boolean }> {
    const entity = await this.toolsRepo.findOne({ where: { slug } });
    if (!entity) {
      return { removed: false };
    }
    await this.auditService.log(actor ?? null, 'tool.delete', 'tool', slug, {
      name: entity.name,
    });
    await this.toolBlogService.deleteByToolSlug(slug);
    await this.toolsRepo.remove(entity);
    return { removed: true };
  }

  async searchByKeyword(keyword: string): Promise<ToolResponseDto[]> {
    const term = `%${keyword.trim()}%`;
    const entities = await this.toolsRepo.find({
      where: [
        { name: ILike(term) },
        { tagline: ILike(term) },
        { category: ILike(term) },
      ],
      order: { name: 'ASC' },
    });
    return entities.map((e) => ToolResponseDto.fromEntity(e));
  }
}
