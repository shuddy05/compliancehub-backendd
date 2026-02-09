import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import { Company } from '../src/database/entities/company.entity';
import { CompanyUser } from '../src/database/entities/company-user.entity';
import * as bcrypt from 'bcryptjs';

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('Please set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in your environment');
    process.exit(1);
  }

  // Use mysql2 driver instead of mysql for better auth support
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'compliancehub_db',
    synchronize: false,
    logging: false,
    entities: [User, Company, CompanyUser],
    driver: require('mysql2') as any,
  } as any);

  console.log('Connecting to database...');
  await ds.initialize();
  console.log('Connected');

  const userRepo = ds.getRepository(User);
  const companyRepo = ds.getRepository(Company);
  const companyUserRepo = ds.getRepository(CompanyUser);

  // Check if user exists
  let user = await userRepo.findOne({ where: { email } });
  if (user) {
    console.log('User already exists:', email);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    user = userRepo.create({
      email,
      passwordHash: hashed,
      firstName: 'Super',
      lastName: 'Admin',
      emailVerified: true,
    });
    user = await userRepo.save(user);
    console.log('Created user:', user.id);
  }

  // Ensure there is a system company to attach the super_admin role to
  let sysCompany = await companyRepo.findOne({ where: { name: 'ComplianceHub System' } });
  if (!sysCompany) {
    sysCompany = companyRepo.create({
      name: 'ComplianceHub System',
      email: process.env.MAIL_FROM || 'noreply@compliancehub.ng',
      subscriptionTier: 'enterprise',
      subscriptionStatus: 'active',
    });
    sysCompany = await companyRepo.save(sysCompany);
    console.log('Created system company:', sysCompany.id);
  }

  // Create company_user link with super_admin role
  const existingLink = await companyUserRepo.findOne({ where: { userId: user.id, companyId: sysCompany.id } });
  if (existingLink) {
    console.log('Company user link already exists with role:', existingLink.role);
  } else {
    const cu = companyUserRepo.create({
      userId: user.id,
      companyId: sysCompany.id,
      role: 'super_admin',
      isPrimaryCompany: true,
      isActive: true,
    });
    await companyUserRepo.save(cu);
    console.log('Assigned super_admin role to user for system company');
  }

  console.log('Done. You can now log in as', email);
  await ds.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error creating super admin:', err);
  process.exit(1);
});
