import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiResumeBuilderService } from './ai-resume-builder.service';
import { GenerateResumeDto } from './dto/generate-resume.dto';

@Controller('ai-resume-builder')
export class AiResumeBuilderController {
  constructor(private readonly resume: AiResumeBuilderService) {}

  @Get('health')
  health() {
    return this.resume.health();
  }

  @Post('generate')
  generate(@Body() body: GenerateResumeDto) {
    return this.resume.generate(body);
  }
}
