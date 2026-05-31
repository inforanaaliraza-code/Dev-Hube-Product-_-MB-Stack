import { Module } from '@nestjs/common';
import { AiParaphraseController } from './ai-paraphrase.controller';
import { AiParaphraseService } from './ai-paraphrase.service';

@Module({
  controllers: [AiParaphraseController],
  providers: [AiParaphraseService],
})
export class AiParaphraseModule {}
