import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CmsContentStatus, CmsContentType } from '../entities/cms-content.entity';

export class CreateContentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsEnum(CmsContentType)
  type!: CmsContentType;

  @IsOptional()
  @IsEnum(CmsContentStatus)
  status?: CmsContentStatus;

  @IsOptional()
  @IsUUID()
  featuredImageId?: string | null;
}
