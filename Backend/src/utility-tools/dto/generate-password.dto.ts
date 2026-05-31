import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GeneratePasswordDto {
  @IsOptional()
  @IsInt()
  @Min(8)
  @Max(128)
  length?: number;

  @IsOptional()
  @IsBoolean()
  uppercase?: boolean;

  @IsOptional()
  @IsBoolean()
  lowercase?: boolean;

  @IsOptional()
  @IsBoolean()
  numbers?: boolean;

  @IsOptional()
  @IsBoolean()
  symbols?: boolean;
}
