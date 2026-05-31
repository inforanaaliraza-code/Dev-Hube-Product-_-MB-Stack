import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiParaphraseService } from './ai-paraphrase.service';
import { ParaphraseDto } from './dto/paraphrase.dto';

@Controller('ai-paraphrase')
export class AiParaphraseController {
  constructor(private readonly paraphrase: AiParaphraseService) {}

  @Get('health')
  health() {
    return this.paraphrase.health();
  }

  @Post('rewrite')
  rewrite(@Body() body: ParaphraseDto) {
    return this.paraphrase.paraphrase(body);
  }
}
