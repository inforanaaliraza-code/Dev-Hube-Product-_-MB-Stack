import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class NavItemDto {
  @IsString()
  @MaxLength(64)
  id!: string;

  @IsString()
  @MaxLength(120)
  label!: string;

  @IsString()
  @MaxLength(500)
  href!: string;

  @IsOptional()
  @IsIn(['_self', '_blank'])
  target?: '_self' | '_blank';

  @IsInt()
  @Min(0)
  sortOrder!: number;

  @IsBoolean()
  enabled!: boolean;
}

export class UpdateNavigationDto {
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => NavItemDto)
  items!: NavItemDto[];
}
