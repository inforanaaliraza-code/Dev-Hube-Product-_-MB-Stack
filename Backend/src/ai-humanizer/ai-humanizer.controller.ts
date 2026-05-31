import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiHumanizerService } from './ai-humanizer.service';
import { HumanizeDto } from './dto/humanize.dto';

@Controller('ai-humanizer')
export class AiHumanizerController {
  constructor(private readonly humanizer: AiHumanizerService) {}

  @Get('health')
  health() {
    return this.humanizer.health();
  }

  @Post('rewrite')
  rewrite(@Body() body: HumanizeDto) {
    return this.humanizer.humanize(body);
  }
}
