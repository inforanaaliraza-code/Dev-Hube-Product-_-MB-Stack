import { BadRequestException, Injectable } from '@nestjs/common';
import { ResolveYoutubeDto } from '../dto/youtube.dto';

@Injectable()
export class YoutubeThumbnailService {
  resolve(dto: ResolveYoutubeDto) {
    const videoId = this.extractVideoId(dto.url.trim());
    if (!videoId) {
      throw new BadRequestException('Invalid YouTube URL or video ID');
    }

    const base = `https://i.ytimg.com/vi/${videoId}`;
    return {
      videoId,
      url: dto.url,
      thumbnails: {
        maxres: `${base}/maxresdefault.jpg`,
        standard: `${base}/sddefault.jpg`,
        high: `${base}/hqdefault.jpg`,
        medium: `${base}/mqdefault.jpg`,
        default: `${base}/default.jpg`,
      },
    };
  }

  private extractVideoId(input: string): string | null {
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }
    try {
      const url = new URL(input);
      const host = url.hostname.replace('www.', '');
      if (host === 'youtu.be') {
        const id = url.pathname.split('/').filter(Boolean)[0];
        return id && id.length === 11 ? id : null;
      }
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        const v = url.searchParams.get('v');
        if (v && v.length === 11) {
          return v;
        }
        const parts = url.pathname.split('/').filter(Boolean);
        const embedIndex = parts.indexOf('embed');
        if (embedIndex >= 0 && parts[embedIndex + 1]?.length === 11) {
          return parts[embedIndex + 1]!;
        }
        const shortsIndex = parts.indexOf('shorts');
        if (shortsIndex >= 0 && parts[shortsIndex + 1]?.length === 11) {
          return parts[shortsIndex + 1]!;
        }
      }
    } catch {
      return null;
    }
    return null;
  }
}
