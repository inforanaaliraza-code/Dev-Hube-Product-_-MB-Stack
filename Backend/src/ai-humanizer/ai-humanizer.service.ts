import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AiWorkerClient } from '../common/ai-worker.client';
import { HumanizeDto } from './dto/humanize.dto';

@Injectable()
export class AiHumanizerService {
  constructor(private readonly ai: AiWorkerClient) {}

  async health() {
    return this.ai.isHealthy();
  }

  async humanize(dto: HumanizeDto) {
    try {
      const data = await this.ai.humanize(dto.text, dto.tone ?? 'natural');
      const health = await this.ai.isHealthy();
      return {
        result: data.result,
        workerAvailable: health.ok,
        aiConfigured: health.configured,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Humanize failed';
      throw new ServiceUnavailableException(
        `AI worker unavailable. Start Services/ai-assistant on 8107 (local model, no API key). ${message}`,
      );
    }
  }
}
