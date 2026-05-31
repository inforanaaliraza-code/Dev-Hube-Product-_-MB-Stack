import { Body, Controller, Get, Post } from '@nestjs/common';
import { DevtoolsCoreService } from './services/devtools-core.service';

const health = () => ({ ok: true });

@Controller('meta-tags-generator')
export class MetaTagsController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('generate') g(@Body() body: Parameters<DevtoolsCoreService['metaTags']>[0]) {
    return this.core.metaTags(body);
  }
}

@Controller('robots-txt')
export class RobotsTxtController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('generate') g(@Body() body: Parameters<DevtoolsCoreService['robotsTxt']>[0]) {
    return this.core.robotsTxt(body);
  }
}

@Controller('sitemap-generator')
export class SitemapController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('generate') g(@Body() body: { urls: string }) {
    return this.core.sitemap(body);
  }
}

@Controller('json-validator')
export class JsonValidatorController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('validate') v(@Body() body: { json: string }) {
    return this.core.jsonValidate(body);
  }
}

@Controller('json-formatter')
export class JsonFormatterController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('format') f(@Body() body: { json: string; minify?: boolean }) {
    return this.core.jsonFormat(body);
  }
}

@Controller('css-minifier')
export class CssMinifierController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('minify') m(@Body() body: { css: string }) {
    return this.core.cssMinify(body);
  }
}

@Controller('js-beautifier')
export class JsBeautifierController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('beautify') b(@Body() body: { code: string }) {
    return this.core.jsBeautify(body);
  }
}

@Controller('html-to-markdown')
export class HtmlToMarkdownController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('convert') c(@Body() body: { html: string }) {
    return this.core.htmlToMarkdown(body);
  }
}

@Controller('regex-tester')
export class RegexTesterController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('test') t(@Body() body: { pattern: string; flags?: string; text: string }) {
    return this.core.regexTest(body);
  }
}

@Controller('csv-to-json')
export class CsvJsonController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('to-json') tj(@Body() body: { csv: string; delimiter?: string }) {
    return this.core.csvToJson(body);
  }
  @Post('to-csv') tc(@Body() body: { json: string }) {
    return this.core.jsonToCsv(body);
  }
}

@Controller('base64')
export class Base64Controller {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('convert') c(@Body() body: { text: string; mode: 'encode' | 'decode' }) {
    return this.core.base64(body);
  }
}

@Controller('jwt-decoder')
export class JwtDecoderController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('decode') d(@Body() body: { token: string }) {
    return this.core.jwtDecode(body);
  }
}

@Controller('url-encoder')
export class UrlEncoderController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('convert') c(@Body() body: { text: string; mode: 'encode' | 'decode' }) {
    return this.core.urlEncode(body);
  }
}

@Controller('uuid-generator')
export class UuidGeneratorController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('generate') g(@Body() body: { version?: string; count?: number }) {
    return this.core.uuidGenerate(body);
  }
}

@Controller('api-tester')
export class ApiTesterController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('send') s(@Body() body: Parameters<DevtoolsCoreService['apiTest']>[0]) {
    return this.core.apiTest(body);
  }
}

@Controller('otp-detector')
export class OtpDetectorController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('detect') d(@Body() body: { subject?: string; text?: string; html?: string }) {
    return this.core.otpDetect(body);
  }
}

@Controller('code-reader')
export class CodeReaderController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('detect') d(@Body() body: { subject?: string; text?: string; html?: string }) {
    return this.core.otpDetect(body);
  }
}

@Controller('color-picker')
export class ColorPickerController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('convert') c(@Body() body: { hex: string }) {
    return this.core.colorPicker(body);
  }
}

@Controller('contrast-checker')
export class ContrastCheckerController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('check') c(@Body() body: { foreground: string; background: string }) {
    return this.core.contrastChecker(body);
  }
}

@Controller('lorem-ipsum')
export class LoremIpsumController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('generate') g(@Body() body: { type?: string; count?: number }) {
    return this.core.loremIpsum(body);
  }
}

@Controller('case-converter')
export class CaseConverterController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('convert') c(@Body() body: { text: string; mode: string }) {
    return this.core.caseConvert(body);
  }
}

@Controller('text-diff')
export class TextDiffController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('diff') d(@Body() body: { left: string; right: string }) {
    return this.core.textDiff(body);
  }
}

@Controller('word-counter')
export class WordCounterController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('count') c(@Body() body: { text: string }) {
    return this.core.wordCounter(body);
  }
}

@Controller('html-stripper')
export class HtmlStripperController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('strip') s(@Body() body: { html: string }) {
    return this.core.htmlStripper(body);
  }
}

@Controller('timestamp-converter')
export class TimestampConverterController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('convert') c(@Body() body: { value: string; mode: string }) {
    return this.core.timestampConvert(body);
  }
}

@Controller('cron-parser')
export class CronParserController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('parse') p(@Body() body: { expression: string }) {
    return this.core.cronParse(body);
  }
}

@Controller('hash-generator')
export class HashGeneratorController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('generate') g(@Body() body: { text: string; algorithms?: string[] }) {
    return this.core.hashGenerate(body);
  }
}

@Controller('unit-converter')
export class UnitConverterController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('convert') c(@Body() body: { value: number; from: string; to: string; rootPx?: number }) {
    return this.core.unitConvert(body);
  }
}

@Controller('user-agent-parser')
export class UserAgentParserController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('parse') p(@Body() body: { ua: string }) {
    return this.core.userAgentParse(body);
  }
}

@Controller('html-entities')
export class HtmlEntitiesController {
  constructor(private readonly core: DevtoolsCoreService) {}
  @Get('health') h() { return health(); }
  @Post('convert') c(@Body() body: { text: string; mode: 'encode' | 'decode' }) {
    return this.core.htmlEntities(body);
  }
}
