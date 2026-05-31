import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateResumeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  jobTitle!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(6000)
  experience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  skills?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  education?: string;
}
