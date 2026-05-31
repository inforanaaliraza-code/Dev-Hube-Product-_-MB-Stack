import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AiWorkerClient } from '../common/ai-worker.client';
import { ParaphraseDto } from './dto/paraphrase.dto';

@Injectable()
export class AiParaphraseService {
  constructor(private readonly ai: AiWorkerClient) {}

  async health() {
    return this.ai.isHealthy();
  }

  async paraphrase(dto: ParaphraseDto) {
    try {
      const data = await this.ai.paraphrase(dto.text, dto.tone ?? 'neutral');
      const health = await this.ai.isHealthy();
      return {
        result: data.result,
        workerAvailable: health.ok,
        aiConfigured: health.configured,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Paraphrase failed';
      throw new ServiceUnavailableException(
        `AI worker unavailable. Start Services/ai-assistant on 8107 (local model, no API key). ${message}`,
      );
    }
  }
}
