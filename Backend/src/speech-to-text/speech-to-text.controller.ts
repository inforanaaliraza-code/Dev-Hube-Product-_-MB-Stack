import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedMemoryFile } from '../common/uploaded-file.type';
import { SpeechToTextService } from './services/speech-to-text.service';

@Controller('speech-to-text')
export class SpeechToTextController {
  constructor(private readonly speechToText: SpeechToTextService) {}

  @Get('health')
  health() {
    return this.speechToText.workerHealth();
  }

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 } }))
  transcribe(@UploadedFile() file: UploadedMemoryFile) {
    return this.speechToText.transcribe(file);
  }
}
