import { Body, Controller, Get, Post } from '@nestjs/common';
import { GeneratePaletteDto } from './dto/palette.dto';
import { PaletteGeneratorService } from './services/palette-generator.service';

@Controller('palette-generator')
export class PaletteGeneratorController {
  constructor(private readonly palette: PaletteGeneratorService) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Post('generate')
  generate(@Body() body: GeneratePaletteDto) {
    return this.palette.generate(body);
  }
}
