import { Module } from '@nestjs/common';
import { AiResumeBuilderController } from './ai-resume-builder.controller';
import { AiResumeBuilderService } from './ai-resume-builder.service';

@Module({
  controllers: [AiResumeBuilderController],
  providers: [AiResumeBuilderService],
})
export class AiResumeBuilderModule {}
