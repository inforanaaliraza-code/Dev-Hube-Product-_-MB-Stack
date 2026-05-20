import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TOOL_CATEGORIES } from '../data/categories';

const ACCENTS = ['violet', 'cyan', 'fuchsia', 'amber', 'emerald'] as const;
const STATUSES = ['ready', 'soon'] as const;

export class CreateToolDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  slug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(300)
  tagline!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsIn([...TOOL_CATEGORIES])
  category!: string;

  @IsString()
  @MaxLength(80)
  icon!: string;

  @IsIn(ACCENTS)
  accent!: string;

  @IsIn(STATUSES)
  status!: string;

  @IsArray()
  @IsString({ each: true })
  keywords!: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
