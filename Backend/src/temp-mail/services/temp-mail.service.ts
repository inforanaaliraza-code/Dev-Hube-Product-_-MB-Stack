import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { CreateMailboxDto } from '../dto/create-mailbox.dto';
import {
  TempDomainDto,
  TempMailboxResponseDto,
  TempMessageDetailDto,
  TempMessageSummaryDto,
} from '../dto/temp-mail-response.dto';
import { TempMailboxEntity } from '../entities/temp-mailbox.entity';
import { MailTmProvider } from '../providers/mail-tm.provider';
import { MailWorkerClient } from './mail-worker.client';

@Injectable()
export class TempMailService {
  constructor(
    @InjectRepository(TempMailboxEntity)
    private readonly mailboxes: Repository<TempMailboxEntity>,
    private readonly mailTm: MailTmProvider,
    private readonly worker: MailWorkerClient,
    private readonly config: ConfigService,
  ) {}

  async getDomains(): Promise<TempDomainDto[]> {
    const domains = await this.mailTm.listDomains();
    return domains.map((domain) => ({ domain }));
  }

  async createMailbox(body: CreateMailboxDto = {}): Promise<TempMailboxResponseDto> {
    const domains = await this.mailTm.listDomains();
    if (domains.length === 0) {
      throw new GoneException('No disposable domains available');
    }
    const requested = body.domain?.trim().toLowerCase();
    let domain = '';
    if (requested) {
      if (!domains.includes(requested)) {
        throw new BadRequestException('That domain is not available for temp mail');
      }
      domain = requested;
    } else {
      domain = domains[Math.floor(Math.random() * domains.length)];
    }
    const password = this.randomPassword();
    const baseLocal = this.resolveLocalPart(body.localPart);
    let address = '';
    let account: { id: string; address: string } | null = null;
    let lastDetail = '';
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const local =
        attempt < 4
          ? attempt === 0
            ? baseLocal
            : `${baseLocal}${Math.floor(Math.random() * 9000) + 1000}`
          : this.randomHumanLocalPart();
      address = `${local}@${domain}`;
      try {
        account = await this.mailTm.createAccount(address, password);
        break;
      } catch (err) {
        lastDetail = err instanceof Error ? err.message : '';
        await this.pause(350 * (attempt + 1));
      }
    }
    if (!account) {
      throw new BadRequestException(
        lastDetail || 'Could not create a disposable address. Try a different name or domain.',
      );
    }
    const token = await this.mailTm.createToken(address, password);
    const ttlMinutes = this.config.get<number>('tempMail.ttlMinutes') ?? 60;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
    const row = this.mailboxes.create({
      address,
      provider: 'mail.tm',
      providerAccountId: account.id,
      providerPassword: password,
      bearerToken: token.token,
      tokenExpiresAt: new Date(Date.now() + 50 * 60_000),
      expiresAt,
      deletedAt: null,
    });
    try {
      const saved = await this.mailboxes.save(row);
      return this.toMailboxDto(saved);
    } catch {
      throw new BadRequestException(
        'This address is already reserved. Try another name or tap New address.',
      );
    }
  }

  async getMailbox(id: string): Promise<TempMailboxResponseDto> {
    const mailbox = await this.requireActiveMailbox(id);
    return this.toMailboxDto(mailbox);
  }

  async deleteMailbox(id: string): Promise<void> {
    const mailbox = await this.requireActiveMailbox(id);
    try {
      const token = await this.ensureToken(mailbox);
      await this.mailTm.deleteAccount(mailbox.providerAccountId, token);
    } catch {
    }
    mailbox.deletedAt = new Date();
    const at = mailbox.address.lastIndexOf('@');
    const domainPart = at > 0 ? mailbox.address.slice(at + 1) : 'invalid';
    mailbox.address = `closed-${mailbox.id.slice(0, 8)}@${domainPart}`;
    await this.mailboxes.save(mailbox);
  }

  async listMessages(mailboxId: string): Promise<TempMessageSummaryDto[]> {
    const mailbox = await this.requireActiveMailbox(mailboxId);
    const token = await this.ensureToken(mailbox);
    const messages = await this.mailTm.listMessages(token);
    const summaries = await Promise.all(
      messages.map(async (message) => {
        const from = message.from?.name
          ? `${message.from.name} <${message.from.address}>`
          : message.from?.address ?? 'unknown';
        const otp = await this.worker.parseOtp(message.subject, message.intro, '');
        return {
          id: message.id,
          from,
          subject: message.subject || '(no subject)',
          intro: message.intro ?? '',
          receivedAt: message.createdAt,
          hasAttachments: message.hasAttachments,
          otpCode: otp.primary,
        } satisfies TempMessageSummaryDto;
      }),
    );
    return summaries.sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    );
  }

  async getMessage(mailboxId: string, messageId: string): Promise<TempMessageDetailDto> {
    const mailbox = await this.requireActiveMailbox(mailboxId);
    const token = await this.ensureToken(mailbox);
    const message = await this.mailTm.getMessage(token, messageId);
    const from = message.from?.name
      ? `${message.from.name} <${message.from.address}>`
      : message.from?.address ?? 'unknown';
    const htmlRaw = Array.isArray(message.html) ? message.html.join('') : '';
    const otp = await this.worker.parseOtp(
      message.subject,
      message.text ?? '',
      htmlRaw,
    );
    const sanitizedHtml = await this.worker.sanitizeHtml(htmlRaw);
    return {
      id: message.id,
      from,
      subject: message.subject || '(no subject)',
      intro: message.intro ?? '',
      receivedAt: message.createdAt,
      hasAttachments: message.hasAttachments,
      otpCode: otp.primary,
      text: message.text ?? '',
      html: htmlRaw,
      sanitizedHtml,
      otpCodes: otp.codes,
    };
  }

  async workerHealth(): Promise<{ ok: boolean }> {
    return { ok: await this.worker.isHealthy() };
  }

  private async requireActiveMailbox(id: string): Promise<TempMailboxEntity> {
    const mailbox = await this.mailboxes.findOne({
      where: {
        id,
        deletedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!mailbox) {
      throw new NotFoundException('Mailbox not found or expired');
    }
    return mailbox;
  }

  private async ensureToken(mailbox: TempMailboxEntity): Promise<string> {
    const now = Date.now();
    if (
      mailbox.bearerToken &&
      mailbox.tokenExpiresAt &&
      mailbox.tokenExpiresAt.getTime() > now + 60_000
    ) {
      return mailbox.bearerToken;
    }
    const token = await this.mailTm.createToken(mailbox.address, mailbox.providerPassword);
    mailbox.bearerToken = token.token;
    mailbox.tokenExpiresAt = new Date(now + 50 * 60_000);
    await this.mailboxes.save(mailbox);
    return token.token;
  }

  private toMailboxDto(mailbox: TempMailboxEntity): TempMailboxResponseDto {
    return {
      id: mailbox.id,
      address: mailbox.address,
      expiresAt: mailbox.expiresAt.toISOString(),
      createdAt: mailbox.createdAt.toISOString(),
    };
  }

  private resolveLocalPart(requested?: string): string {
    const cleaned = this.sanitizeLocalPart(requested);
    if (requested?.trim() && !cleaned) {
      throw new BadRequestException(
        'Username must be 3–64 characters (letters, numbers, dot, underscore, hyphen)',
      );
    }
    return cleaned ?? this.randomHumanLocalPart();
  }

  private sanitizeLocalPart(input?: string): string | null {
    if (!input?.trim()) {
      return null;
    }
    const cleaned = input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .slice(0, 64);
    if (cleaned.length < 3) {
      return null;
    }
    return cleaned;
  }

  private randomHumanLocalPart(): string {
    const first = [
      'john',
      'emma',
      'liam',
      'olivia',
      'noah',
      'ava',
      'james',
      'mia',
      'lucas',
      'sophia',
      'ethan',
      'isabella',
      'mason',
      'amelia',
      'logan',
      'charlotte',
    ];
    const last = [
      'smith',
      'johnson',
      'brown',
      'taylor',
      'wilson',
      'anderson',
      'thomas',
      'martin',
      'lee',
      'walker',
      'hall',
      'young',
      'king',
      'wright',
      'scott',
      'green',
    ];
    const f = first[Math.floor(Math.random() * first.length)];
    const l = last[Math.floor(Math.random() * last.length)];
    const n = Math.floor(Math.random() * 900) + 100;
    const patterns = [
      () => `${f}.${l}`,
      () => `${f}_${l}`,
      () => `${f}.${l}${n}`,
      () => `${f}${l}${n}`,
    ];
    return patterns[Math.floor(Math.random() * patterns.length)]();
  }

  private pause(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private randomPassword(): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let out = '';
    for (let i = 0; i < 24; i += 1) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }
}
