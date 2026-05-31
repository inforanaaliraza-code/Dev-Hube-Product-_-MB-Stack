import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AiWorkerClient } from '../common/ai-worker.client';
import { GenerateCodeDto } from './dto/generate-code.dto';

@Injectable()
export class AiCodeGeneratorService {
  constructor(private readonly ai: AiWorkerClient) {}

  async health() {
    return this.ai.isHealthy();
  }

  async generate(dto: GenerateCodeDto) {
    try {
      const data = await this.ai.generateCode(
        dto.prompt,
        dto.language ?? 'typescript',
      );
      const health = await this.ai.isHealthy();
      return {
        code: data.code,
        language: data.language,
        workerAvailable: health.ok,
        aiConfigured: health.configured,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      throw new ServiceUnavailableException(
        `AI worker unavailable. Start Services/ai-assistant on port 8107 (local model, no API key). ${message}`,
      );
    }
  }
}
