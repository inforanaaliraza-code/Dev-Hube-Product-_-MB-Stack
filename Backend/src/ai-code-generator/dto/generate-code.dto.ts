import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateCodeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(8000)
  prompt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  language?: string;
}
