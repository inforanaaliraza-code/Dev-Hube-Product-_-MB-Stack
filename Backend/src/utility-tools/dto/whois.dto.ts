import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class WhoisLookupDto {
  @IsString()
  @MinLength(1)
  @MaxLength(253)
  @Matches(/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/)
  domain!: string;
}
