export class CreateEmployeeDto {
  employeeCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  department?: string;
  jobTitle?: string;
  employmentType: string; // full_time, part_time, contract
  employmentStartDate: Date;
  grossSalary: number;
  salaryFrequency?: string = 'monthly';
  bankDetails?: {
    name: string;
    account: string;
    accountName: string;
  };
  taxId?: string;
  pensionPin?: string;
  pensionProvider?: string;
  allowances?: Record<string, number>;
}
