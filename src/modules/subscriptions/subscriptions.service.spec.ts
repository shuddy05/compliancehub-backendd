import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from '../../database/entities/company.entity';
import { Subscription } from '../../database/entities/subscription.entity';
import { PaymentTransaction } from '../../database/entities/payment-transaction.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let companyRepo: Partial<Repository<Company>>;
  let subscriptionRepo: Partial<Repository<Subscription>>;
  let paymentRepo: Partial<Repository<PaymentTransaction>>;
  let companyUserRepo: Partial<Repository<CompanyUser>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: getRepositoryToken(Company), useValue: mockRepository() },
        { provide: getRepositoryToken(Subscription), useValue: mockRepository() },
        { provide: getRepositoryToken(PaymentTransaction), useValue: mockRepository() },
        { provide: getRepositoryToken(CompanyUser), useValue: mockRepository() },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    companyRepo = module.get(getRepositoryToken(Company));
    subscriptionRepo = module.get(getRepositoryToken(Subscription));
    paymentRepo = module.get(getRepositoryToken(PaymentTransaction));
    companyUserRepo = module.get(getRepositoryToken(CompanyUser));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('initiatePayment should throw if company not found', async () => {
    (companyUserRepo.findOne as any).mockResolvedValue({ id: 'u' });
    (companyRepo.findOne as any).mockResolvedValue(undefined);

    await expect(
      service.initiatePayment('non-existent', 'pro', 'monthly', 'user-id'),
    ).rejects.toThrow();
  });
});
