import { Body, Controller, Get, Post } from '@nestjs/common';
import { FormatSqlDto } from './dto/format-sql.dto';
import { SqlFormatterService } from './services/sql-formatter.service';

@Controller('sql-formatter')
export class SqlFormatterController {
  constructor(private readonly sql: SqlFormatterService) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Post('format')
  format(@Body() body: FormatSqlDto) {
    return this.sql.format(body);
  }
}
