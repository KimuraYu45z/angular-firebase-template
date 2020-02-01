import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { LoadingDialogService } from '../core/services/loading-dialog.service';
import { BehaviorSubject } from 'rxjs';

export interface PaymentDialogComponentData {
  currency: string;
  amount: number;
  stripe: {
    pk: string;
  };
}

export interface PaymentDialogComponentResult {
  token: stripe.Token;
}

@Component({
  selector: 'lib-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.css']
})
export class PaymentDialogComponent implements OnInit {
  error?: stripe.Error;

  _stripe!: stripe.Stripe;
  _elements!: stripe.elements.Elements;
  _card!: stripe.elements.Element;

  @ViewChild('cardElement', { static: true })
  cardElement!: ElementRef;

  constructor(
    private dialogRef: MatDialogRef<
      PaymentDialogComponent,
      PaymentDialogComponentResult
    >,
    private loadingDialog: LoadingDialogService,
    @Inject(MAT_DIALOG_DATA)
    public data: PaymentDialogComponentData
  ) {}

  ngOnInit() {
    if (!window.document.getElementById('stripe-script')) {
      var s = window.document.createElement('script');
      s.id = 'stripe-script';
      s.type = 'text/javascript';
      s.src = 'https://js.stripe.com/v3/';
      window.document.body.appendChild(s);
    }
    this._stripe = Stripe(this.data.stripe.pk);
    this._elements = this._stripe.elements();

    this._card = this._elements.create('card');
    this._card.mount(this.cardElement.nativeElement);
  }

  async onSubmit() {
    this.error = undefined;

    const message$ = new BehaviorSubject('Processing');
    this.loadingDialog.open(message$);

    const { token, error } = await this._stripe.createToken(this._card);

    if (error) {
      this.error = error;
      message$.error('Error');
    } else {
      message$.next('Complete');
      message$.complete();

      this.dialogRef.close({ token: token! });
    }
  }
}
