import { BadRequestException, Injectable } from '@nestjs/common';
import { IpLookupDto } from '../dto/ip-lookup.dto';

@Injectable()
export class IpLookupService {
  async lookup(dto: IpLookupDto, requestIp?: string) {
    const target = dto.ip?.trim() || requestIp;
    if (!target) {
      throw new BadRequestException('IP address is required');
    }

    const fields = [
      'status',
      'message',
      'country',
      'countryCode',
      'region',
      'regionName',
      'city',
      'zip',
      'lat',
      'lon',
      'timezone',
      'isp',
      'org',
      'as',
      'query',
    ].join(',');

    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(target)}?fields=${fields}`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) {
      throw new BadRequestException('IP lookup service unavailable');
    }
    const data = (await res.json()) as { status?: string; message?: string };
    if (data.status === 'fail') {
      throw new BadRequestException(data.message ?? 'Invalid IP address');
    }
    return data;
  }
}
