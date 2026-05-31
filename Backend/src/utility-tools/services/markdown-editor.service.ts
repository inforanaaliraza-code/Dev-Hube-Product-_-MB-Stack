import { BadRequestException, Injectable } from '@nestjs/common';
import { marked } from 'marked';
import { PreviewMarkdownDto } from '../dto/markdown.dto';

@Injectable()
export class MarkdownEditorService {
  async preview(dto: PreviewMarkdownDto) {
    const markdown = dto.markdown ?? '';
    if (!markdown.trim()) {
      return { html: '' };
    }
    try {
      const html = await marked.parse(markdown);
      return { html: String(html) };
    } catch {
      throw new BadRequestException('Invalid markdown');
    }
  }
}
