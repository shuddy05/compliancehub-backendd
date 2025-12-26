export class UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  department?: string;
  grossSalary?: number;
  bankDetails?: {
    name: string;
    account: string;
    accountName: string;
  };
  taxId?: string;
  pensionPin?: string;
  allowances?: Record<string, number>;
}
