import { IsIP, IsOptional, IsString } from 'class-validator';

export class IpLookupDto {
  @IsOptional()
  @IsString()
  @IsIP()
  ip?: string;
}
