import { Module } from '@nestjs/common';
import { SpeechToTextController } from './speech-to-text.controller';
import { SpeechToTextService } from './services/speech-to-text.service';
import { SpeechToTextWorkerClient } from './services/speech-to-text-worker.client';

@Module({
  controllers: [SpeechToTextController],
  providers: [SpeechToTextService, SpeechToTextWorkerClient],
})
export class SpeechToTextModule {}
