import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMailboxDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  domain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  localPart?: string;
}
