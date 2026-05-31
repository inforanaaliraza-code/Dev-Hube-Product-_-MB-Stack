import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

const SCHEMA_TYPES = ['BlogPosting', 'Article', 'HowTo', 'FAQPage', 'TechArticle'] as const;
const TWITTER_CARDS = ['summary_large_image', 'summary'] as const;

export class UpsertToolBlogDto {
  @IsString()
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsIn(['draft', 'published'])
  status!: 'draft' | 'published';

  @IsOptional()
  @IsUUID()
  featuredImageId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  featuredImageAlt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaTitle?: string | null;

  @IsOptional()
  @IsString()
  metaDescription?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  focusKeyword?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  canonicalUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  ogTitle?: string | null;

  @IsOptional()
  @IsString()
  ogDescription?: string | null;

  @IsOptional()
  @IsUUID()
  ogImageId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ogImageAlt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  twitterTitle?: string | null;

  @IsOptional()
  @IsString()
  twitterDescription?: string | null;

  @IsOptional()
  @IsIn(TWITTER_CARDS)
  twitterCard?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  articleSection?: string | null;

  @IsOptional()
  @IsIn(SCHEMA_TYPES)
  schemaType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  seoLocale?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  readingTimeMinutes?: number | null;

  @IsOptional()
  @IsBoolean()
  autoGenerateSchema?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  robots?: string;

  @IsOptional()
  @IsBoolean()
  noindex?: boolean;

  @IsOptional()
  @IsBoolean()
  nofollow?: boolean;

  @IsOptional()
  @IsString()
  schemaJson?: string | null;
}
