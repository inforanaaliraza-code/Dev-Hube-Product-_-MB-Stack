import { BadRequestException, Injectable } from '@nestjs/common';
import { SpeedTestDto } from '../dto/speed-test.dto';

@Injectable()
export class SpeedTestService {
  async test(dto: SpeedTestDto) {
    let target: URL;
    try {
      target = new URL(dto.url.trim());
    } catch {
      throw new BadRequestException('Invalid URL');
    }
    if (!['http:', 'https:'].includes(target.protocol)) {
      throw new BadRequestException('Only http and https URLs are supported');
    }

    const started = Date.now();
    let statusCode = 0;
    let downloadBytes = 0;
    let contentType: string | null = null;

    try {
      const res = await fetch(target.toString(), {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(30000),
        headers: { 'User-Agent': 'DevHubeSpeedTest/1.0' },
      });
      statusCode = res.status;
      contentType = res.headers.get('content-type');
      const buffer = await res.arrayBuffer();
      downloadBytes = buffer.byteLength;
    } catch {
      throw new BadRequestException('Could not reach URL');
    }

    const totalMs = Date.now() - started;
    const downloadSeconds = totalMs / 1000;
    const throughputKbps =
      downloadSeconds > 0 ? Math.round((downloadBytes * 8) / downloadSeconds / 1000) : 0;

    let rating = 'poor';
    if (totalMs < 800) rating = 'excellent';
    else if (totalMs < 1500) rating = 'good';
    else if (totalMs < 3000) rating = 'fair';

    return {
      url: target.toString(),
      statusCode,
      totalMs,
      downloadBytes,
      contentType,
      throughputKbps,
      rating,
    };
  }
}
