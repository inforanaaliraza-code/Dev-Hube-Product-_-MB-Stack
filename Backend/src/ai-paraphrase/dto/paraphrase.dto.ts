import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ParaphraseDto {
  @IsString()
  @MinLength(3)
  @MaxLength(12000)
  text!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  tone?: string;
}
