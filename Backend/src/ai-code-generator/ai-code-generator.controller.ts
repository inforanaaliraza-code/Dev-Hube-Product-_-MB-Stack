import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiCodeGeneratorService } from './ai-code-generator.service';
import { GenerateCodeDto } from './dto/generate-code.dto';

@Controller('ai-code-generator')
export class AiCodeGeneratorController {
  constructor(private readonly aiCode: AiCodeGeneratorService) {}

  @Get('health')
  health() {
    return this.aiCode.health();
  }

  @Post('generate')
  generate(@Body() body: GenerateCodeDto) {
    return this.aiCode.generate(body);
  }
}
