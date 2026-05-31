import { Body, Controller, Get, Post } from '@nestjs/common';
import { CheckPasswordDto } from './dto/check-password.dto';
import { GeneratePasswordDto } from './dto/generate-password.dto';
import { PasswordGeneratorService } from './services/password-generator.service';

@Controller('password-generator')
export class PasswordGeneratorController {
  constructor(private readonly passwords: PasswordGeneratorService) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Post('generate')
  generate(@Body() body: GeneratePasswordDto) {
    return this.passwords.generate(body);
  }

  @Post('check-breach')
  checkBreach(@Body() body: CheckPasswordDto) {
    return this.passwords.checkBreach(body);
  }
}
