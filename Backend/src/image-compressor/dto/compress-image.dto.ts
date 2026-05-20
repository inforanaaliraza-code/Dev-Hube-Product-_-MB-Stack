import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CompressImageQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  @Max(100)
  quality?: number;

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  })
  @IsInt()
  @Min(64)
  @Max(8192)
  maxWidth?: number;

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  })
  @IsInt()
  @Min(64)
  @Max(8192)
  maxHeight?: number;

  @IsOptional()
  @IsIn(['auto', 'jpeg', 'png', 'webp'])
  outputFormat?: 'auto' | 'jpeg' | 'png' | 'webp';

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  stripMetadata?: boolean;
}
