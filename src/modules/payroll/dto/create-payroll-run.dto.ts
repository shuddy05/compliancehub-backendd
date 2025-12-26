export class CreatePayrollRunDto {
  payrollPeriod: string; // YYYY-MM format
  payrollStartDate: Date;
  payrollEndDate: Date;
  paymentDate?: Date;
}
