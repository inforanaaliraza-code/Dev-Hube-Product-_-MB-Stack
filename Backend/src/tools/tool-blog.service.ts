import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MediaAssetEntity } from '../cms/entities/media-asset.entity';
import { ToolEntity } from './entities/tool.entity';
import { ToolBlogPostEntity } from './entities/tool-blog-post.entity';
import { UpsertToolBlogDto } from './dto/upsert-tool-blog.dto';

export interface ToolBlogResponse {
  id: string | null;
  toolSlug: string;
  toolName: string;
  toolTagline: string;
  toolCategory: string;
  toolIcon: string;
  toolAccent: string;
  title: string;
  excerpt: string;
  body: string;
  status: string;
  featuredImageId: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  metaKeywords: string[];
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageId: string | null;
  ogImageUrl: string | null;
  ogImageAlt: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterCard: string;
  authorName: string | null;
  articleSection: string | null;
  schemaType: string;
  seoLocale: string;
  readingTimeMinutes: number | null;
  autoGenerateSchema: boolean;
  robots: string;
  noindex: boolean;
  nofollow: boolean;
  schemaJson: string | null;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

@Injectable()
export class ToolBlogService {
  constructor(
    @InjectRepository(ToolBlogPostEntity)
    private readonly blogRepo: Repository<ToolBlogPostEntity>,
    @InjectRepository(ToolEntity)
    private readonly toolsRepo: Repository<ToolEntity>,
    @InjectRepository(MediaAssetEntity)
    private readonly mediaRepo: Repository<MediaAssetEntity>,
  ) {}

  async adminListAll(): Promise<ToolBlogResponse[]> {
    const tools = await this.toolsRepo.find({ order: { name: 'ASC' } });
    const rows = await this.blogRepo.find();
    const blogMap = new Map(rows.map((r) => [r.toolSlug, r]));
    const results: ToolBlogResponse[] = [];
    for (const tool of tools) {
      results.push(await this.toResponse(tool, blogMap.get(tool.slug) ?? null));
    }
    return results;
  }

  async adminGet(toolSlug: string): Promise<ToolBlogResponse> {
    const tool = await this.requireTool(toolSlug);
    const row = await this.blogRepo.findOne({ where: { toolSlug } });
    return this.toResponse(tool, row);
  }

  async adminUpsert(toolSlug: string, dto: UpsertToolBlogDto): Promise<ToolBlogResponse> {
    const tool = await this.requireTool(toolSlug);
    let row = await this.blogRepo.findOne({ where: { toolSlug } });
    if (!row) {
      row = this.blogRepo.create({ toolSlug, title: dto.title, status: 'draft' });
    }
    row.title = dto.title;
    if (dto.excerpt !== undefined) row.excerpt = dto.excerpt;
    if (dto.body !== undefined) row.body = dto.body;
    row.status = dto.status;
    if (dto.featuredImageId !== undefined) row.featuredImageId = dto.featuredImageId;
    if (dto.featuredImageAlt !== undefined) row.featuredImageAlt = dto.featuredImageAlt;
    if (dto.metaTitle !== undefined) row.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) row.metaDescription = dto.metaDescription;
    if (dto.focusKeyword !== undefined) row.focusKeyword = dto.focusKeyword;
    if (dto.metaKeywords !== undefined) row.metaKeywords = dto.metaKeywords;
    if (dto.canonicalUrl !== undefined) row.canonicalUrl = dto.canonicalUrl;
    if (dto.ogTitle !== undefined) row.ogTitle = dto.ogTitle;
    if (dto.ogDescription !== undefined) row.ogDescription = dto.ogDescription;
    if (dto.ogImageId !== undefined) row.ogImageId = dto.ogImageId;
    if (dto.ogImageAlt !== undefined) row.ogImageAlt = dto.ogImageAlt;
    if (dto.twitterTitle !== undefined) row.twitterTitle = dto.twitterTitle;
    if (dto.twitterDescription !== undefined) row.twitterDescription = dto.twitterDescription;
    if (dto.twitterCard !== undefined) row.twitterCard = dto.twitterCard;
    if (dto.authorName !== undefined) row.authorName = dto.authorName;
    if (dto.articleSection !== undefined) row.articleSection = dto.articleSection;
    if (dto.schemaType !== undefined) row.schemaType = dto.schemaType;
    if (dto.seoLocale !== undefined) row.seoLocale = dto.seoLocale;
    if (dto.readingTimeMinutes !== undefined) {
      row.readingTimeMinutes = dto.readingTimeMinutes;
    } else if (dto.body !== undefined) {
      row.readingTimeMinutes = this.estimateReadingMinutes(dto.body);
    }
    if (dto.robots !== undefined) row.robots = dto.robots;
    if (dto.noindex !== undefined) row.noindex = dto.noindex;
    if (dto.nofollow !== undefined) row.nofollow = dto.nofollow;
    if (dto.autoGenerateSchema !== undefined) {
      row.autoGenerateSchema = dto.autoGenerateSchema;
    }
    if (!row.autoGenerateSchema && dto.schemaJson !== undefined) {
      row.schemaJson = dto.schemaJson;
    }
    if (dto.status === 'published' && !row.publishedAt) {
      row.publishedAt = new Date();
    }
    if (dto.status === 'draft') {
      row.publishedAt = null;
    }
    const saved = await this.blogRepo.save(row);
    const response = await this.toResponse(tool, saved);
    if (saved.autoGenerateSchema) {
      const siteBase = (process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
        /\/$/,
        '',
      );
      const canonical =
        saved.canonicalUrl ?? `${siteBase}/tools/${tool.slug}#tool-blog`;
      const imageForSchema = response.featuredImageUrl
        ? response.featuredImageUrl.startsWith('http')
          ? response.featuredImageUrl
          : `${siteBase}${response.featuredImageUrl.startsWith('/') ? '' : '/'}${response.featuredImageUrl.replace(/^\//, '')}`
        : null;
      saved.schemaJson = this.buildSchemaJson(tool, saved, imageForSchema, canonical);
      await this.blogRepo.save(saved);
      response.schemaJson = saved.schemaJson;
    } else if (dto.schemaJson !== undefined) {
      response.schemaJson = dto.schemaJson;
    }
    return response;
  }

  async deleteByToolSlug(toolSlug: string) {
    const row = await this.blogRepo.findOne({ where: { toolSlug } });
    if (row) await this.blogRepo.remove(row);
  }

  async listPublished(): Promise<ToolBlogResponse[]> {
    const rows = await this.blogRepo.find({
      where: { status: 'published' },
      order: { publishedAt: 'DESC' },
    });
    if (!rows.length) return [];
    const slugs = rows.map((r) => r.toolSlug);
    const tools = await this.toolsRepo.find({ where: { slug: In(slugs) } });
    const toolMap = new Map(tools.map((t) => [t.slug, t]));
    const results: ToolBlogResponse[] = [];
    for (const row of rows) {
      const tool = toolMap.get(row.toolSlug);
      if (!tool) continue;
      results.push(await this.toResponse(tool, row));
    }
    return results;
  }

  async getPublishedByToolSlug(toolSlug: string): Promise<ToolBlogResponse> {
    const tool = await this.toolsRepo.findOne({ where: { slug: toolSlug } });
    if (!tool) throw new NotFoundException(`Tool "${toolSlug}" not found`);
    const row = await this.blogRepo.findOne({
      where: { toolSlug, status: 'published' },
    });
    if (!row) throw new NotFoundException('Blog post not found');
    return this.toResponse(tool, row);
  }

  private async requireTool(slug: string): Promise<ToolEntity> {
    const tool = await this.toolsRepo.findOne({ where: { slug } });
    if (!tool) throw new NotFoundException(`Tool "${slug}" not found`);
    return tool;
  }

  private async resolveMediaUrl(id: string | null): Promise<string | null> {
    if (!id) return null;
    const asset = await this.mediaRepo.findOne({ where: { id } });
    if (!asset) return null;
    return `/api/v1/uploads/${asset.urlPath.replace(/^\//, '')}`;
  }

  private async toResponse(
    tool: ToolEntity,
    row: ToolBlogPostEntity | null,
  ): Promise<ToolBlogResponse> {
    const featuredImageUrl = row
      ? await this.resolveMediaUrl(row.featuredImageId)
      : null;
    const ogImageUrl = row ? await this.resolveMediaUrl(row.ogImageId) : null;
    return {
      id: row?.id ?? null,
      toolSlug: tool.slug,
      toolName: tool.name,
      toolTagline: tool.tagline,
      toolCategory: tool.category,
      toolIcon: tool.icon,
      toolAccent: tool.accent,
      title: row?.title ?? '',
      excerpt: row?.excerpt ?? '',
      body: row?.body ?? '',
      status: row?.status ?? 'draft',
      featuredImageId: row?.featuredImageId ?? null,
      featuredImageUrl,
      featuredImageAlt: row?.featuredImageAlt ?? null,
      metaTitle: row?.metaTitle ?? null,
      metaDescription: row?.metaDescription ?? null,
      focusKeyword: row?.focusKeyword ?? null,
      metaKeywords: row?.metaKeywords ?? [],
      canonicalUrl: row?.canonicalUrl ?? null,
      ogTitle: row?.ogTitle ?? null,
      ogDescription: row?.ogDescription ?? null,
      ogImageId: row?.ogImageId ?? null,
      ogImageUrl,
      ogImageAlt: row?.ogImageAlt ?? null,
      twitterTitle: row?.twitterTitle ?? null,
      twitterDescription: row?.twitterDescription ?? null,
      twitterCard: row?.twitterCard ?? 'summary_large_image',
      authorName: row?.authorName ?? null,
      articleSection: row?.articleSection ?? tool.category,
      schemaType: row?.schemaType ?? 'BlogPosting',
      seoLocale: row?.seoLocale ?? 'en',
      readingTimeMinutes: row?.readingTimeMinutes ?? null,
      autoGenerateSchema: row?.autoGenerateSchema ?? true,
      robots: row?.robots ?? 'index,follow',
      noindex: row?.noindex ?? false,
      nofollow: row?.nofollow ?? false,
      schemaJson: row?.schemaJson ?? null,
      publishedAt: row?.publishedAt?.toISOString() ?? null,
      createdAt: row?.createdAt?.toISOString() ?? null,
      updatedAt: row?.updatedAt?.toISOString() ?? null,
    };
  }

  private estimateReadingMinutes(html: string): number {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(' ').length : 0;
    return Math.max(1, Math.ceil(words / 200));
  }

  private buildSchemaJson(
    tool: ToolEntity,
    row: ToolBlogPostEntity,
    imageUrl: string | null,
    canonical: string,
  ): string {
    const headline = row.metaTitle || row.title;
    const description = row.metaDescription || row.excerpt;
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': row.schemaType || 'BlogPosting',
      headline,
      description,
      image: imageUrl ? [imageUrl] : undefined,
      author: row.authorName
        ? { '@type': 'Person', name: row.authorName }
        : { '@type': 'Organization', name: 'Dev Hube' },
      publisher: {
        '@type': 'Organization',
        name: 'Dev Hube',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonical,
      },
      articleSection: row.articleSection || tool.category,
      keywords: row.metaKeywords?.length
        ? row.metaKeywords.join(', ')
        : row.focusKeyword || undefined,
      inLanguage: row.seoLocale || 'en',
      timeRequired: row.readingTimeMinutes
        ? `PT${row.readingTimeMinutes}M`
        : undefined,
      datePublished: row.publishedAt?.toISOString(),
      dateModified: row.updatedAt?.toISOString(),
    };
    return JSON.stringify(schema, null, 2);
  }
}
