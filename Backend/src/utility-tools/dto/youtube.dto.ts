import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResolveYoutubeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  url!: string;
}
