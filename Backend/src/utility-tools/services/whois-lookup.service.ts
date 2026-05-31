import { BadRequestException, Injectable } from '@nestjs/common';
import whoiser from 'whoiser';
import { WhoisLookupDto } from '../dto/whois.dto';

@Injectable()
export class WhoisLookupService {
  async lookup(dto: WhoisLookupDto) {
    const domain = dto.domain.trim().toLowerCase().replace(/^www\./, '');
    try {
      const raw = (await whoiser(domain)) as Record<string, Record<string, unknown>>;
      const entry = Object.values(raw)[0];
      return {
        domain,
        registrar: this.pick(entry, ['Registrar', 'registrar']),
        created: this.pick(entry, ['Creation Date', 'Created Date', 'created']),
        expires: this.pick(entry, ['Registry Expiry Date', 'Expiry Date', 'expires']),
        updated: this.pick(entry, ['Updated Date', 'updated']),
        nameservers: this.pickList(entry, ['Name Server', 'Name Servers', 'nserver']),
        raw,
      };
    } catch {
      throw new BadRequestException('WHOIS lookup failed for this domain');
    }
  }

  private pick(entry: Record<string, unknown> | undefined, keys: string[]) {
    if (!entry) return null;
    for (const key of keys) {
      const value = entry[key];
      if (value != null && String(value).trim()) {
        return Array.isArray(value) ? value[0] : value;
      }
    }
    return null;
  }

  private pickList(entry: Record<string, unknown> | undefined, keys: string[]) {
    const value = this.pick(entry, keys);
    if (!value) return [];
    return Array.isArray(value) ? value.map(String) : [String(value)];
  }
}
