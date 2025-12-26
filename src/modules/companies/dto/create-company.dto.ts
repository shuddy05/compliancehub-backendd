export class CreateCompanyDto {
  name: string;
  tin?: string;
  rcNumber?: string;
  industry?: string;
  address?: string;
  state?: string;
  lga?: string;
  phone?: string;
  email?: string;
  defaultCurrency?: string = 'NGN';
  timezone?: string = 'Africa/Lagos';
}
