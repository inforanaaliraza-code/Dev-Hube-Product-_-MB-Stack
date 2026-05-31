import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AiWorkerClient } from '../common/ai-worker.client';
import { GenerateResumeDto } from './dto/generate-resume.dto';

@Injectable()
export class AiResumeBuilderService {
  constructor(private readonly ai: AiWorkerClient) {}

  async health() {
    return this.ai.isHealthy();
  }

  async generate(dto: GenerateResumeDto) {
    try {
      const data = await this.ai.generateResume({
        fullName: dto.fullName,
        jobTitle: dto.jobTitle,
        summary: dto.summary ?? '',
        experience: dto.experience ?? '',
        skills: dto.skills ?? '',
        education: dto.education ?? '',
      });
      const health = await this.ai.isHealthy();
      return {
        resumeMarkdown: data.resume_markdown,
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
