import { Module } from '@nestjs/common';
import { ToolsModule } from '../tools/tools.module';
import { AdminToolsController } from './admin-tools.controller';

@Module({
  imports: [ToolsModule],
  controllers: [AdminToolsController],
})
export class AdminModule {}
