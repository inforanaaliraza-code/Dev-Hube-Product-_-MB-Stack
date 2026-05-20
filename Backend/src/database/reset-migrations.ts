import 'dotenv/config';
import dataSource from './data-source';

async function run() {
  await dataSource.initialize();
  try {
    await dataSource.query('DELETE FROM migrations');
    console.log('Cleared migrations table. Run: pnpm run migration:run');
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
