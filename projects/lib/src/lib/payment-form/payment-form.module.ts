import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentFormComponent } from './payment-form.component';

@NgModule({
  declarations: [PaymentFormComponent],
  imports: [CommonModule],
  exports: [PaymentFormComponent],
})
export class PaymentFormModule {}
