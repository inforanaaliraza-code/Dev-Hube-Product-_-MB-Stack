import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CreateContentDto } from '../dto/create-content.dto';
import { UpdateContentDto } from '../dto/update-content.dto';
import {
  CmsContentEntity,
  CmsContentStatus,
  CmsContentType,
} from '../entities/cms-content.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(CmsContentEntity)
    private readonly contentRepo: Repository<CmsContentEntity>,
  ) {}

  async adminList(type?: CmsContentType) {
    const where = type ? { type } : {};
    const rows = await this.contentRepo.find({
      where,
      order: { updatedAt: 'DESC' },
    });
    return rows.map((r) => this.toResponse(r));
  }

  async adminGet(id: string) {
    const row = await this.findOrFail(id);
    return this.toResponse(row);
  }

  async create(dto: CreateContentDto, user?: UserEntity) {
    const slug = this.normalizeSlug(dto.slug);
    const exists = await this.contentRepo.findOne({ where: { slug } });
    if (exists) throw new ConflictException('Slug already exists');
    const status = dto.status ?? CmsContentStatus.DRAFT;
    const row = this.contentRepo.create({
      slug,
      title: dto.title,
      excerpt: dto.excerpt ?? '',
      body: dto.body ?? '',
      type: dto.type,
      status,
      featuredImageId: dto.featuredImageId ?? null,
      authorId: user?.id ?? null,
      publishedAt:
        status === CmsContentStatus.PUBLISHED ? new Date() : null,
    });
    const saved = await this.contentRepo.save(row);
    return this.toResponse(saved);
  }

  async update(id: string, dto: UpdateContentDto) {
    const row = await this.findOrFail(id);
    if (dto.slug !== undefined) {
      const slug = this.normalizeSlug(dto.slug);
      if (slug !== row.slug) {
        const exists = await this.contentRepo.findOne({ where: { slug } });
        if (exists) throw new ConflictException('Slug already exists');
        row.slug = slug;
      }
    }
    if (dto.title !== undefined) row.title = dto.title;
    if (dto.excerpt !== undefined) row.excerpt = dto.excerpt;
    if (dto.body !== undefined) row.body = dto.body;
    if (dto.type !== undefined) row.type = dto.type;
    if (dto.featuredImageId !== undefined) {
      row.featuredImageId = dto.featuredImageId;
    }
    if (dto.status !== undefined) {
      row.status = dto.status;
      if (dto.status === CmsContentStatus.PUBLISHED && !row.publishedAt) {
        row.publishedAt = new Date();
      }
      if (dto.status === CmsContentStatus.DRAFT) {
        row.publishedAt = null;
      }
    }
    const saved = await this.contentRepo.save(row);
    return this.toResponse(saved);
  }

  async remove(id: string) {
    const row = await this.findOrFail(id);
    await this.contentRepo.remove(row);
  }

  async bulk(
    ids: string[],
    action: 'delete' | 'setStatus',
    status?: CmsContentStatus,
  ) {
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

  async getPublishedPage(slug: string) {
    const row = await this.contentRepo.findOne({
      where: {
        slug: this.normalizeSlug(slug),
        type: CmsContentType.PAGE,
        status: CmsContentStatus.PUBLISHED,
      },
    });
    if (!row) throw new NotFoundException('Page not found');
    return this.toResponse(row);
  }

  async listPublishedPosts() {
    const rows = await this.contentRepo.find({
      where: {
        type: CmsContentType.POST,
        status: CmsContentStatus.PUBLISHED,
      },
      order: { publishedAt: 'DESC' },
    });
    return rows.map((r) => this.toResponse(r));
  }

  async getPublishedPost(slug: string) {
    const row = await this.contentRepo.findOne({
      where: {
        slug: this.normalizeSlug(slug),
        type: CmsContentType.POST,
        status: CmsContentStatus.PUBLISHED,
      },
    });
    if (!row) throw new NotFoundException('Post not found');
    return this.toResponse(row);
  }

  private async findOrFail(id: string) {
    const row = await this.contentRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Content not found');
    return row;
  }

  private normalizeSlug(slug: string) {
    return slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private toResponse(row: CmsContentEntity) {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      body: row.body,
      type: row.type,
      status: row.status,
      featuredImageId: row.featuredImageId,
      publishedAt: row.publishedAt,
      authorId: row.authorId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
