import { BadRequestException, Injectable } from '@nestjs/common';
import { format } from 'sql-formatter';
import { FormatSqlDto } from '../dto/format-sql.dto';

@Injectable()
export class SqlFormatterService {
  format(dto: FormatSqlDto) {
    const sql = dto.sql?.trim();
    if (!sql) {
      throw new BadRequestException('SQL is required');
    }
    const dialect = dto.dialect ?? 'sql';
    try {
      const formatted = format(sql, { language: dialect as never, tabWidth: 2 });
      return { formatted, dialect };
    } catch {
      throw new BadRequestException('Could not format SQL');
    }
  }
}
