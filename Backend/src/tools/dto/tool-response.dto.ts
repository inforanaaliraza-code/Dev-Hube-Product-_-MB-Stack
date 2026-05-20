import { ToolEntity } from '../entities/tool.entity';

export class ToolResponseDto {
  id!: string;
  slug!: string;
  name!: string;
  tagline!: string;
  description!: string;
  category!: string;
  icon!: string;
  accent!: string;
  status!: string;
  keywords!: string[];
  featured?: boolean;

  static fromEntity(entity: ToolEntity): ToolResponseDto {
    const dto = new ToolResponseDto();
    dto.id = entity.id;
    dto.slug = entity.slug;
    dto.name = entity.name;
    dto.tagline = entity.tagline;
    dto.description = entity.description;
    dto.category = entity.category;
    dto.icon = entity.icon;
    dto.accent = entity.accent;
    dto.status = entity.status;
    dto.keywords = entity.keywords ?? [];
    if (entity.featured) {
      dto.featured = true;
    }
    return dto;
  }
}
