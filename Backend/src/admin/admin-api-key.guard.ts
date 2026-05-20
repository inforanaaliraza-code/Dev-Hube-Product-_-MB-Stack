import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const header = request.headers['x-admin-key'];
    const expected = this.config.get<string>('admin.apiKey');
    if (!expected || header !== expected) {
      throw new UnauthorizedException('Invalid admin API key');
    }
    return true;
  }
}
