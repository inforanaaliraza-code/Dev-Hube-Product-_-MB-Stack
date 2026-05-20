import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { QrGeneratorService } from './services/qr-generator.service';

@Controller('qr-generator')
export class QrGeneratorController {
  constructor(private readonly qr: QrGeneratorService) {}

  @Get('health')
  health() {
    return this.qr.workerHealth();
  }

  @Post('codes')
  create(@Body() body: CreateQrCodeDto) {
    return this.qr.create(body);
  }

  @Get('codes/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.qr.findOne(id);
  }

  @Get('codes/:id/image')
  image(@Param('id', ParseUUIDPipe) id: string) {
    return this.qr.regenerateImage(id);
  }

  @Patch('codes/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateQrCodeDto,
  ) {
    return this.qr.update(id, body);
  }

  @Delete('codes/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.qr.remove(id);
  }

  @Get('codes/:id/analytics')
  analytics(@Param('id', ParseUUIDPipe) id: string) {
    return this.qr.getAnalytics(id);
  }

  @Get('go/:shortCode')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const target = await this.qr.recordScanAndResolve(shortCode, req);
    res.redirect(302, target);
  }
}
