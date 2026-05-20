import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedMemoryFile } from '../common/uploaded-file.type';
import { CompressImageQueryDto } from './dto/compress-image.dto';
import { ImageCompressorService } from './services/image-compressor.service';

@Controller('image-compressor')
export class ImageCompressorController {
  constructor(private readonly images: ImageCompressorService) {}

  @Get('health')
  health() {
    return this.images.workerHealth();
  }

  @Post('compress')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  compress(
    @UploadedFile() file: UploadedMemoryFile,
    @Query() query: CompressImageQueryDto,
  ) {
    return this.images.compress(file, query);
  }
}
