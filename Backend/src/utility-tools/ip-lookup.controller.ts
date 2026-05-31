import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { IpLookupDto } from './dto/ip-lookup.dto';
import { IpLookupService } from './services/ip-lookup.service';

@Controller('ip-lookup')
export class IpLookupController {
  constructor(private readonly ipLookup: IpLookupService) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Post('lookup')
  lookup(@Body() body: IpLookupDto, @Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      body.ip ??
      (typeof forwarded === 'string'
        ? forwarded.split(',')[0]?.trim()
        : req.ip?.replace('::ffff:', ''));
    return this.ipLookup.lookup(body, clientIp);
  }
}
