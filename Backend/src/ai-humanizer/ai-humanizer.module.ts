import { Module } from '@nestjs/common';
import { AiHumanizerController } from './ai-humanizer.controller';
import { AiHumanizerService } from './ai-humanizer.service';

@Module({
  controllers: [AiHumanizerController],
  providers: [AiHumanizerService],
})
export class AiHumanizerModule {}
