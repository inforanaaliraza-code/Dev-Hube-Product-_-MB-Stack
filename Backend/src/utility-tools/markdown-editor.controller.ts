import { Body, Controller, Get, Post } from '@nestjs/common';
import { PreviewMarkdownDto } from './dto/markdown.dto';
import { MarkdownEditorService } from './services/markdown-editor.service';

@Controller('markdown-editor')
export class MarkdownEditorController {
  constructor(private readonly markdown: MarkdownEditorService) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Post('preview')
  preview(@Body() body: PreviewMarkdownDto) {
    return this.markdown.preview(body);
  }
}
