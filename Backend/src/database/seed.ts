import 'dotenv/config';
import dataSource from './data-source';
import { seedAdmin } from './seeds/admin.seed';
import { seedSettings } from './seeds/settings.seed';
import { seedTools } from './seeds/tools.seed';
import { SiteSettingEntity } from '../settings/entities/site-setting.entity';
import { ToolEntity } from '../tools/entities/tool.entity';
import { UserEntity } from '../users/entities/user.entity';

async function run() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@devhube.com';
  const password = process.env.ADMIN_PASSWORD ?? 'changeme';

  await dataSource.initialize();

  try {
    const usersRepo = dataSource.getRepository(UserEntity);
    const settingsRepo = dataSource.getRepository(SiteSettingEntity);
    const toolsRepo = dataSource.getRepository(ToolEntity);

    const admin = await seedAdmin(usersRepo, email, password);
    await seedSettings(settingsRepo);
    await seedTools(toolsRepo);

    console.log(`Seed complete. Admin: ${admin.email}`);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
