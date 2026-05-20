import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { IsNull, Repository } from 'typeorm';
import { CreateQrCodeDto } from '../dto/create-qr-code.dto';
import { UpdateQrCodeDto } from '../dto/update-qr-code.dto';
import { QrCodeEntity } from '../entities/qr-code.entity';
import { QrScanEntity } from '../entities/qr-scan.entity';
import { normalizeHexColor } from '../utils/color.util';
import { hashIp } from '../utils/qr-fallback.util';
import { generateShortCode } from '../utils/short-code.util';
import { QrWorkerClient } from './qr-worker.client';

export type QrCodeResponse = {
  id: string;
  mode: 'static' | 'dynamic';
  contentType: 'url' | 'text';
  payload: string;
  encodedData: string;
  shortCode: string | null;
  redirectUrl: string | null;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrection: string;
  sizePx: number;
  hasLogo: boolean;
  scanCount: number;
  trackScans: boolean;
  createdAt: string;
  updatedAt: string;
  imagePngBase64?: string;
  workerAvailable?: boolean;
};

export type QrAnalyticsResponse = {
  totalScans: number;
  scans: Array<{
    id: string;
    scannedAt: string;
    userAgent: string | null;
    referer: string | null;
  }>;
};

@Injectable()
export class QrGeneratorService {
  private readonly publicBaseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly worker: QrWorkerClient,
    @InjectRepository(QrCodeEntity)
    private readonly codes: Repository<QrCodeEntity>,
    @InjectRepository(QrScanEntity)
    private readonly scans: Repository<QrScanEntity>,
  ) {
    const apiBase =
      this.config.get<string>('qrGenerator.publicApiUrl') ??
      'http://localhost:4000/api/v1';
    this.publicBaseUrl = apiBase.replace(/\/$/, '');
  }

  async workerHealth() {
    const ok = await this.worker.isHealthy();
    return { ok };
  }

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private validatePayload(dto: CreateQrCodeDto) {
    const payload = dto.payload.trim();
    if (!payload) {
      throw new BadRequestException('Payload is required');
    }
    if (dto.contentType === 'url' && !this.isValidUrl(payload)) {
      throw new BadRequestException('Payload must be a valid http or https URL');
    }
    if (dto.mode === 'dynamic') {
      if (dto.contentType !== 'url') {
        throw new BadRequestException('Dynamic QR codes require URL content');
      }
      if (!this.isValidUrl(payload)) {
        throw new BadRequestException('Dynamic target must be a valid URL');
      }
    }
    if (dto.trackScans && dto.contentType === 'text') {
      throw new BadRequestException('Scan tracking requires URL content');
    }
    return payload;
  }

  private buildRedirectUrl(shortCode: string): string {
    return `${this.publicBaseUrl}/qr-generator/go/${shortCode}`;
  }

  private async allocateShortCode(): Promise<string> {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const code = generateShortCode(8);
      const collision = await this.codes.findOne({
        where: { shortCode: code },
        withDeleted: true,
      });
      if (!collision) {
        return code;
      }
    }
    throw new BadRequestException('Could not allocate short code');
  }

  private resolveEncodedData(
    dto: CreateQrCodeDto,
    payload: string,
    shortCode: string | null,
  ): { encodedData: string; trackScans: boolean } {
    const trackScans = dto.mode === 'dynamic' || Boolean(dto.trackScans);
    if (trackScans && shortCode) {
      return {
        encodedData: this.buildRedirectUrl(shortCode),
        trackScans: true,
      };
    }
    return { encodedData: payload, trackScans: false };
  }

  private toResponse(
    entity: QrCodeEntity,
    extra?: Partial<QrCodeResponse>,
  ): QrCodeResponse {
    const trackScans = Boolean(entity.shortCode);
    return {
      id: entity.id,
      mode: entity.mode,
      contentType: entity.contentType,
      payload: entity.payload,
      encodedData: entity.encodedData,
      shortCode: entity.shortCode,
      redirectUrl: entity.shortCode
        ? this.buildRedirectUrl(entity.shortCode)
        : null,
      foregroundColor: entity.foregroundColor,
      backgroundColor: entity.backgroundColor,
      errorCorrection: entity.errorCorrection,
      sizePx: entity.sizePx,
      hasLogo: entity.hasLogo,
      scanCount: entity.scanCount,
      trackScans,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      ...extra,
    };
  }

  async create(dto: CreateQrCodeDto): Promise<QrCodeResponse> {
    const payload = this.validatePayload(dto);
    const foregroundColor = normalizeHexColor(dto.foregroundColor, '#000000');
    const backgroundColor = normalizeHexColor(dto.backgroundColor, '#ffffff');
    const errorCorrection = dto.errorCorrection ?? 'H';
    const sizePx = dto.sizePx ?? 512;
    const logoScale = dto.logoScale ?? 0.22;
    const hasLogo = Boolean(dto.logoBase64?.trim());

    const trackScans = dto.mode === 'dynamic' || Boolean(dto.trackScans);
    let shortCode: string | null = null;
    if (trackScans) {
      shortCode = await this.allocateShortCode();
    }

    const { encodedData } = this.resolveEncodedData(dto, payload, shortCode);

    const generated = await this.worker.generate({
      data: encodedData,
      foreground: foregroundColor,
      background: backgroundColor,
      sizePx,
      errorCorrection,
      logoBase64: dto.logoBase64,
      logoScale,
    });

    const entity = this.codes.create({
      shortCode,
      mode: dto.mode,
      contentType: dto.contentType,
      payload,
      encodedData,
      foregroundColor,
      backgroundColor,
      errorCorrection,
      sizePx,
      hasLogo,
      logoScale,
      scanCount: 0,
    });
    const saved = await this.codes.save(entity);
    const workerOk = await this.worker.isHealthy();

    return this.toResponse(saved, {
      imagePngBase64: generated.pngBase64,
      workerAvailable: workerOk,
    });
  }

  async findOne(id: string): Promise<QrCodeResponse> {
    const entity = await this.codes.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!entity) {
      throw new NotFoundException('QR code not found');
    }
    return this.toResponse(entity);
  }

  async regenerateImage(id: string): Promise<QrCodeResponse> {
    const entity = await this.codes.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!entity) {
      throw new NotFoundException('QR code not found');
    }
    const generated = await this.worker.generate({
      data: entity.encodedData,
      foreground: entity.foregroundColor,
      background: entity.backgroundColor,
      sizePx: entity.sizePx,
      errorCorrection: entity.errorCorrection as 'L' | 'M' | 'Q' | 'H',
      logoScale: entity.logoScale,
    });
    const workerOk = await this.worker.isHealthy();
    return this.toResponse(entity, {
      imagePngBase64: generated.pngBase64,
      workerAvailable: workerOk,
    });
  }

  async update(id: string, dto: UpdateQrCodeDto): Promise<QrCodeResponse> {
    const entity = await this.codes.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!entity) {
      throw new NotFoundException('QR code not found');
    }
    if (entity.mode !== 'dynamic') {
      throw new BadRequestException('Only dynamic QR codes can be updated');
    }
    if (!dto.payload?.trim()) {
      throw new BadRequestException('Payload is required');
    }
    const payload = dto.payload.trim();
    if (!this.isValidUrl(payload)) {
      throw new BadRequestException('Payload must be a valid http or https URL');
    }
    entity.payload = payload;
    const saved = await this.codes.save(entity);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.codes.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!entity) {
      throw new NotFoundException('QR code not found');
    }
    await this.codes.softRemove(entity);
  }

  async getAnalytics(id: string): Promise<QrAnalyticsResponse> {
    const entity = await this.codes.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!entity) {
      throw new NotFoundException('QR code not found');
    }
    if (!entity.shortCode) {
      throw new BadRequestException('Analytics are only available for tracked QR codes');
    }
    const rows = await this.scans.find({
      where: { qrCodeId: entity.id },
      order: { scannedAt: 'DESC' },
      take: 100,
    });
    return {
      totalScans: entity.scanCount,
      scans: rows.map((row) => ({
        id: row.id,
        scannedAt: row.scannedAt.toISOString(),
        userAgent: row.userAgent,
        referer: row.referer,
      })),
    };
  }

  async recordScanAndResolve(
    shortCode: string,
    req: Request,
  ): Promise<string> {
    const entity = await this.codes.findOne({
      where: { shortCode, deletedAt: IsNull() },
    });
    if (!entity) {
      throw new NotFoundException('QR code not found');
    }

    const userAgent =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent'].slice(0, 512)
        : null;
    const referer =
      typeof req.headers.referer === 'string'
        ? req.headers.referer.slice(0, 512)
        : null;
    const forwarded = req.headers['x-forwarded-for'];
    const ipRaw =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0]?.trim()
        : req.ip;
    const ipHash = hashIp(ipRaw);

    await this.scans.save(
      this.scans.create({
        qrCodeId: entity.id,
        userAgent,
        referer,
        ipHash,
      }),
    );
    await this.codes.increment({ id: entity.id }, 'scanCount', 1);

    if (entity.mode === 'dynamic' || entity.contentType === 'url') {
      return entity.payload;
    }
    return entity.payload;
  }
}
