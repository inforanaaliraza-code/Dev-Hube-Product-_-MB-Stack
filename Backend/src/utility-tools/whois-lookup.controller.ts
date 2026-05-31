import { Body, Controller, Get, Post } from '@nestjs/common';
import { WhoisLookupDto } from './dto/whois.dto';
import { WhoisLookupService } from './services/whois-lookup.service';

@Controller('whois-lookup')
export class WhoisLookupController {
  constructor(private readonly whois: WhoisLookupService) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Post('lookup')
  lookup(@Body() body: WhoisLookupDto) {
    return this.whois.lookup(body);
  }
}
