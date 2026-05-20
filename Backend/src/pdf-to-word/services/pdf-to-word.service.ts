import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadedMemoryFile } from '../../common/uploaded-file.type';
import { ConvertPdfQueryDto } from '../dto/convert-pdf.dto';
import { PdfWorkerClient } from './pdf-worker.client';

export type ConvertPdfResponse = {
  docxBase64: string;
  originalBytes: number;
  docxBytes: number;
  pageCount: number;
  convertedPages: number;
  filename: string;
  originalName: string;
  workerAvailable: boolean;
};

@Injectable()
export class PdfToWordService {
  private readonly maxBytes: number;

  constructor(
    private readonly config: ConfigService,
    private readonly worker: PdfWorkerClient,
  ) {
    this.maxBytes =
      this.config.get<number>('pdfToWord.maxBytes') ?? 25 * 1024 * 1024;
  }

  async workerHealth() {
    const ok = await this.worker.isHealthy();
    return { ok };
  }

  async convert(
    file: UploadedMemoryFile | undefined,
    query: ConvertPdfQueryDto,
  ): Promise<ConvertPdfResponse> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('PDF file is required');
    }
    if (file.size > this.maxBytes) {
      throw new BadRequestException('File exceeds 25 MB limit');
    }

    const mime = file.mimetype?.toLowerCase() ?? '';
    const name = (file.originalname || '').toLowerCase();
    if (mime !== 'application/pdf' && !name.endsWith('.pdf')) {
      throw new BadRequestException('Only PDF files are supported');
    }

    if (
      query.startPage != null &&
      query.endPage != null &&
      query.endPage < query.startPage
    ) {
      throw new BadRequestException('End page must be greater than or equal to start page');
    }

    try {
      const result = await this.worker.convert({
        buffer: file.buffer,
        filename: file.originalname || 'document.pdf',
        startPage: query.startPage,
        endPage: query.endPage,
      });
      const workerOk = await this.worker.isHealthy();
      return {
        docxBase64: result.docxBase64,
        originalBytes: result.originalBytes,
        docxBytes: result.docxBytes,
        pageCount: result.pageCount,
        convertedPages: result.convertedPages,
        filename: result.filename,
        originalName: file.originalname || 'document.pdf',
        workerAvailable: workerOk,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      throw new ServiceUnavailableException(
        `PDF worker unavailable. Start Services/pdf-to-word on port 8103. ${message}`,
      );
    }
  }
}
