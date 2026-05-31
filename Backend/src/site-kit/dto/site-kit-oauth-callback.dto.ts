import { IsString, MinLength } from 'class-validator';

export class SiteKitOAuthCallbackDto {
  @IsString()
  @MinLength(4)
  code!: string;
}
