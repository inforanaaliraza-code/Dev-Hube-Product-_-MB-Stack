import { Body, Controller, Get, Post } from '@nestjs/common';
import { ResolveYoutubeDto } from './dto/youtube.dto';
import { YoutubeThumbnailService } from './services/youtube-thumbnail.service';

@Controller('youtube-thumbnail')
export class YoutubeThumbnailController {
  constructor(private readonly youtube: YoutubeThumbnailService) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Post('resolve')
  resolve(@Body() body: ResolveYoutubeDto) {
    return this.youtube.resolve(body);
  }
}
