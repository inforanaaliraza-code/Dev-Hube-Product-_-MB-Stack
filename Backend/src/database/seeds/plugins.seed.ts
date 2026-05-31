import { Repository } from 'typeorm';
import {
  PluginEntity,
  PluginStatus,
  PluginType,
} from '../../plugins/entities/plugin.entity';

const DEFAULT_PLUGINS: Array<Partial<PluginEntity> & { slug: string; name: string }> = [
  {
    slug: 'google-site-kit',
    name: 'Google Site Kit',
    description: 'Analytics, Search Console, PageSpeed and monetization dashboard',
    version: '1.0.0',
    type: PluginType.INTEGRATION,
    status: PluginStatus.ACTIVE,
    category: 'analytics',
    adminPath: '/site-kit',
    isSystem: true,
  },
  {
    slug: 'temp-mail-worker',
    name: 'Temp Mail Worker',
    description: 'Python worker for disposable email (port 8100)',
    version: '1.0.0',
    type: PluginType.WORKER,
    status: PluginStatus.ACTIVE,
    category: 'worker',
    isSystem: true,
  },
  {
    slug: 'qr-generator-worker',
    name: 'QR Generator Worker',
    description: 'Python worker for QR codes (port 8101)',
    version: '1.0.0',
    type: PluginType.WORKER,
    status: PluginStatus.ACTIVE,
    category: 'worker',
    isSystem: true,
  },
  {
    slug: 'ai-assistant-worker',
    name: 'AI Assistant Worker',
    description: 'Python worker for AI tools (port 8107)',
    version: '1.0.0',
    type: PluginType.WORKER,
    status: PluginStatus.ACTIVE,
    category: 'worker',
    isSystem: true,
  },
];

export async function seedPlugins(repo: Repository<PluginEntity>) {
  for (const row of DEFAULT_PLUGINS) {
    const exists = await repo.findOne({ where: { slug: row.slug } });
    if (!exists) {
      await repo.save(repo.create(row));
    }
  }
}
