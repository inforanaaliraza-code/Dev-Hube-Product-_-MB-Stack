import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class SplitPdfQueryDto {
  @IsOptional()
  @IsIn(['range', 'each'])
  mode?: 'range' | 'each';

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  })
  @IsInt()
  @Min(1)
  @Max(500)
  startPage?: number;

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  })
  @IsInt()
  @Min(1)
  @Max(500)
  endPage?: number;
}
