import { Body, Controller, Get, Post } from '@nestjs/common';
import { SpeedTestDto } from './dto/speed-test.dto';
import { SpeedTestService } from './services/speed-test.service';

@Controller('speed-test')
export class SpeedTestController {
  constructor(private readonly speedTest: SpeedTestService) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Post('run')
  run(@Body() body: SpeedTestDto) {
    return this.speedTest.test(body);
  }
}
