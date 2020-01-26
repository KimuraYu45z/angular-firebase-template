import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material";
import {
  PaymentDialogComponent,
  PaymentDialogComponentData,
  PaymentDialogComponentResult
} from "../../payment-dialog/payment-dialog.component";

@Injectable({
  providedIn: "root"
})
export class PaymentDialogService {
  constructor(private dialog: MatDialog) {}

  open(currency: string, amount: number, stripe: { pk: string }) {
    return this.dialog.open<
      PaymentDialogComponent,
      PaymentDialogComponentData,
      PaymentDialogComponentResult
    >(PaymentDialogComponent, { data: { currency, amount, stripe } });
  }
}
