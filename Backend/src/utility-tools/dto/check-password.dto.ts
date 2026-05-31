import { IsString, MaxLength, MinLength } from 'class-validator';

export class CheckPasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  password!: string;
}
