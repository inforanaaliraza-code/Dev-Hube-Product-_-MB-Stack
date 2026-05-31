import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class BulkToolsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  slugs!: string[];

  @IsIn(['delete', 'setStatus', 'setFeatured'])
  action!: 'delete' | 'setStatus' | 'setFeatured';

  @IsOptional()
  @IsIn(['ready', 'soon'])
  status?: 'ready' | 'soon';

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
