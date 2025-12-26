export class CreateComplianceFilingDto {
  obligationType: string; // PAYE, VAT, WHT, etc
  filingPeriod: string; // YYYY-MM
  filingYear: number;
  filingMonth: number;
  dueDate: Date;
  calculatedAmount?: number;
}
