import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { CmsContentStatus } from '../entities/cms-content.entity';

export class BulkContentDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids!: string[];

  @IsIn(['delete', 'setStatus'])
  action!: 'delete' | 'setStatus';

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: CmsContentStatus;
}
