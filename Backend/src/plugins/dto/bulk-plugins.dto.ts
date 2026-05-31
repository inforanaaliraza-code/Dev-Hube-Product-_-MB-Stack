import { ArrayMinSize, IsArray, IsIn, IsOptional, IsUUID } from 'class-validator';
import { PluginStatus } from '../entities/plugin.entity';

export class BulkPluginsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids!: string[];

  @IsIn(['delete', 'setStatus'])
  action!: 'delete' | 'setStatus';

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: PluginStatus;
}
