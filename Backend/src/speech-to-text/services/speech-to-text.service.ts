import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadedMemoryFile } from '../../common/uploaded-file.type';
import { SpeechToTextWorkerClient } from './speech-to-text-worker.client';

@Injectable()
export class SpeechToTextService {
  private readonly maxBytes: number;

  constructor(
    private readonly config: ConfigService,
    private readonly worker: SpeechToTextWorkerClient,
  ) {
    this.maxBytes =
      this.config.get<number>('speechToText.maxBytes') ?? 25 * 1024 * 1024;
  }

  async workerHealth() {
    return { ok: await this.worker.isHealthy() };
  }

  async transcribe(file: UploadedMemoryFile | undefined) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Audio file is required');
    }
    if (file.size > this.maxBytes) {
      throw new BadRequestException('File exceeds 25 MB limit');
    }
    const name = (file.originalname || '').toLowerCase();
    if (!/\.(wav|mp3|m4a|webm|ogg|flac)$/i.test(name)) {
      throw new BadRequestException('Supported: wav, mp3, m4a, webm, ogg, flac');
    }

    try {
      const result = await this.worker.transcribe(
        file.buffer,
        file.originalname || 'audio.wav',
      );
      return {
        ...result,
        originalName: file.originalname || 'audio.wav',
        workerAvailable: await this.worker.isHealthy(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription failed';
      throw new ServiceUnavailableException(
        `Speech to text worker unavailable. Start Services/speech-to-text on port 8109. ${message}`,
      );
    }
  }
}
