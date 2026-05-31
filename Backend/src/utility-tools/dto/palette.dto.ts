import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class GeneratePaletteDto {
  @IsOptional()
  @IsIn(['random', 'complementary', 'analogous', 'triadic', 'monochrome'])
  mode?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#?[0-9a-fA-F]{6}$/)
  baseColor?: string;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(12)
  count?: number;
}
