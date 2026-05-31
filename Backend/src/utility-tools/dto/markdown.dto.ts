import { IsString, MaxLength } from 'class-validator';

export class PreviewMarkdownDto {
  @IsString()
  @MaxLength(200000)
  markdown!: string;
}
