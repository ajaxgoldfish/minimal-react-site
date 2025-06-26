import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';

async function main() {
  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations finished!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

main(); 