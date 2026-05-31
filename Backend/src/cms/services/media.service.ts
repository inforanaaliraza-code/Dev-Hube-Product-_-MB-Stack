import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { UploadedMemoryFile } from '../../common/uploaded-file.type';
import { MediaAssetEntity } from '../entities/media-asset.entity';

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

@Injectable()
export class MediaService {
  private readonly mediaDir = join(process.cwd(), 'uploads', 'media');

  constructor(
    @InjectRepository(MediaAssetEntity)
    private readonly mediaRepo: Repository<MediaAssetEntity>,
  ) {
    if (!existsSync(this.mediaDir)) {
      mkdirSync(this.mediaDir, { recursive: true });
    }
  }

  async list() {
    const rows = await this.mediaRepo.find({ order: { createdAt: 'DESC' } });
    return rows.map((r) => this.toResponse(r));
  }

  async upload(file: UploadedMemoryFile, alt?: string) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }
    if (!ALLOWED.has(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File exceeds 10MB limit');
    }
    const ext = this.extFromMime(file.mimetype);
    const filename = `${randomUUID()}${ext}`;
    const diskPath = join(this.mediaDir, filename);
    writeFileSync(diskPath, file.buffer);
    const urlPath = `media/${filename}`;
    const row = await this.mediaRepo.save(
      this.mediaRepo.create({
        filename,
        originalName: file.originalname.slice(0, 255),
        mimeType: file.mimetype,
        sizeBytes: file.size,
        urlPath,
        alt: alt?.slice(0, 255) ?? null,
      }),
    );
    return this.toResponse(row);
  }

  async remove(id: string) {
    const row = await this.mediaRepo.findOne({ where: { id } });
    if (!row) {
      return { deleted: false, alreadyRemoved: true };
    }
    const diskPath = join(this.mediaDir, row.filename);
    if (existsSync(diskPath)) unlinkSync(diskPath);
    await this.mediaRepo.remove(row);
    return { deleted: true, alreadyRemoved: false };
  }

  async bulkDelete(ids: string[]) {
    const unique = [...new Set(ids)];
    let affected = 0;
    const errors: string[] = [];

    for (const id of unique) {
      try {
        const result = await this.remove(id);
        if (result.deleted || result.alreadyRemoved) affected += 1;
      } catch {
        errors.push(id);
      }
    }

    return { affected, failed: errors.length, errors };
  }

  getFileStream(filename: string) {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const diskPath = join(this.mediaDir, safe);
    if (!existsSync(diskPath)) {
      throw new NotFoundException('File not found');
    }
    return { stream: createReadStream(diskPath), path: diskPath };
  }

  private extFromMime(mime: string) {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
    };
    return map[mime] ?? '.bin';
  }

  private toResponse(row: MediaAssetEntity) {
    return {
      id: row.id,
      filename: row.filename,
      originalName: row.originalName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      urlPath: row.urlPath,
      url: row.urlPath,
      alt: row.alt,
      createdAt: row.createdAt,
    };
  }
}
