import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateQrCodeDto {
  @IsIn(['static', 'dynamic'])
  mode!: 'static' | 'dynamic';

  @IsIn(['url', 'text'])
  contentType!: 'url' | 'text';

  @IsString()
  @MaxLength(4096)
  payload!: string;

  @IsOptional()
  @IsBoolean()
  trackScans?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  foregroundColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  backgroundColor?: string;

  @IsOptional()
  @IsIn(['L', 'M', 'Q', 'H'])
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';

  @IsOptional()
  @IsInt()
  @Min(128)
  @Max(2048)
  sizePx?: number;

  @IsOptional()
  @IsString()
  @MaxLength(700_000)
  logoBase64?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.12)
  @Max(0.3)
  logoScale?: number;
}
