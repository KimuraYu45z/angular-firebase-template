import { Injectable, Inject } from '@angular/core';
import { MatDialog } from '@angular/material';
import {
  PaymentDialogComponent,
  PaymentDialogComponentData,
  PaymentDialogComponentResult
} from '../../../../payment-dialog/payment-dialog.component';
import { CONFIG, Config } from '../../../types/config';

@Injectable({
  providedIn: 'root'
})
export class PaymentDialogService {
  constructor(
    private dialog: MatDialog,
    @Inject(CONFIG)
    private config: Config
  ) {}

  open(currency: string, amount: number) {
    if (!this.config.stripe) {
      throw Error('config.stripe is undefined');
    }
    return this.dialog.open<
      PaymentDialogComponent,
      PaymentDialogComponentData,
      PaymentDialogComponentResult
    >(PaymentDialogComponent, {
      data: { currency, amount, stripe: this.config.stripe }
    });
  }
}
