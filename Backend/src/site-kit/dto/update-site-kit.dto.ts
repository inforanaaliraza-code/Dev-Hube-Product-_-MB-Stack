import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class SiteKitModulesDto {
  @IsOptional()
  @IsBoolean()
  analytics?: boolean;

  @IsOptional()
  @IsBoolean()
  searchConsole?: boolean;

  @IsOptional()
  @IsBoolean()
  pagespeed?: boolean;

  @IsOptional()
  @IsBoolean()
  adsense?: boolean;
}

export class UpdateSiteKitDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SiteKitModulesDto)
  modules?: SiteKitModulesDto;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  propertyId?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  siteUrl?: string;

  @IsOptional()
  @IsBoolean()
  adsenseConnected?: boolean;
}
