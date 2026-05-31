import { Module } from '@nestjs/common';
import { AiCodeGeneratorController } from './ai-code-generator.controller';
import { AiCodeGeneratorService } from './ai-code-generator.service';

@Module({
  controllers: [AiCodeGeneratorController],
  providers: [AiCodeGeneratorService],
})
export class AiCodeGeneratorModule {}
