import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { databaseConfig } from '../src/config/database.config';
import { User } from '../src/database/entities/user.entity';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email address as argument: npx ts-node scripts/delete-user.ts <email>');
    process.exit(1);
  }

  const dsOptions = databaseConfig();
  // databaseConfig returns a Nest TypeOrmModuleOptions object; coerce to DataSource options
  const ds = new DataSource({ ...(dsOptions as any), synchronize: false } as any);

  console.log('Connecting to database...');
  await ds.initialize();
  console.log('Connected');

  const userRepo = ds.getRepository(User);

  // Check if user exists
  const user = await userRepo.findOne({ where: { email } });
  if (!user) {
    console.error('User not found:', email);
    await ds.destroy();
    process.exit(1);
  }

  console.log('Found user:', {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  // Delete the user (cascade will handle companyUsers and related records)
  await userRepo.remove(user);
  console.log('✓ User deleted successfully:', email);

  await ds.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
