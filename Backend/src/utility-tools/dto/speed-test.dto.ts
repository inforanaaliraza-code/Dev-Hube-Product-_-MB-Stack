import { IsString, MaxLength, MinLength } from 'class-validator';

export class SpeedTestDto {
  @IsString()
  @MinLength(4)
  @MaxLength(2000)
  url!: string;
}
