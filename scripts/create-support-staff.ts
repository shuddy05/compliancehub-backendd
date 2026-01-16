import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { databaseConfig } from '../src/config/database.config';
import { User } from '../src/database/entities/user.entity';
import { Company } from '../src/database/entities/company.entity';
import { CompanyUser } from '../src/database/entities/company-user.entity';
import * as bcrypt from 'bcryptjs';

async function main() {
  const email = 'support@compliancehub.ng';
  const password = process.env.SUPPORT_STAFF_PASSWORD || 'Support@123456';

  const dsOptions = databaseConfig();
  const ds = new DataSource({ ...(dsOptions as any), synchronize: false } as any);

  console.log('Connecting to database...');
  await ds.initialize();
  console.log('Connected');

  const userRepo = ds.getRepository(User);
  const companyRepo = ds.getRepository(Company);
  const companyUserRepo = ds.getRepository(CompanyUser);

  // Check if user exists
  let user = await userRepo.findOne({ where: { email } });
  if (user) {
    console.log('Support staff user already exists:', email);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    user = userRepo.create({
      email,
      passwordHash: hashed,
      firstName: 'Support',
      lastName: 'Staff',
      emailVerified: true,
      onboardingCompleted: true,
    });
    user = await userRepo.save(user);
    console.log('Created support staff user:', user.id);
  }

  // Ensure there is a system company to attach the support_staff role to
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

  // Create company_user link with support_staff role
  const existingLink = await companyUserRepo.findOne({
    where: { userId: user.id, companyId: sysCompany.id },
  });
  if (existingLink) {
    console.log('Company user link already exists with role:', existingLink.role);
  } else {
    const cu = companyUserRepo.create({
      userId: user.id,
      companyId: sysCompany.id,
      role: 'support_staff',
      isPrimaryCompany: true,
      isActive: true,
    });
    await companyUserRepo.save(cu);
    console.log('Assigned support_staff role to user for system company');
  }

  console.log('Done. You can now log in as:', email);
  console.log('Password:', password);
  await ds.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error creating support staff:', err);
  process.exit(1);
});
