import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PluginStatus, PluginType } from '../entities/plugin.entity';

export class CreatePluginDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  slug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  version?: string;

  @IsEnum(PluginType)
  type!: PluginType;

  @IsOptional()
  @IsEnum(PluginStatus)
  status?: PluginStatus;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  adminPath?: string | null;
}
