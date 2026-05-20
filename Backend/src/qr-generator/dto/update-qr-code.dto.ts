import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateQrCodeDto {
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  @IsUrl({ require_protocol: true }, { message: 'payload must be a valid URL with http or https' })
  payload?: string;
}
