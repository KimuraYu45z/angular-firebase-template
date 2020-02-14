import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject,
} from '@angular/core';
import { Config, CONFIG, ErrorStripeConfigUndefined } from '../core';

// @dynamic
@Component({
  selector: 'lib-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css'],
})
export class PaymentFormComponent implements OnInit {
  error?: stripe.Error;

  _stripe!: stripe.Stripe;
  _elements!: stripe.elements.Elements;
  _card!: stripe.elements.Element;

  @ViewChild('cardElement', { static: true })
  cardElement!: ElementRef;

  constructor(
    @Inject(CONFIG)
    private config: Config,
  ) {
    if (!this.config.stripe) {
      throw new ErrorStripeConfigUndefined();
    }
  }

  ngOnInit() {
    if (!window.document.getElementById('stripe-script')) {
      var s = window.document.createElement('script');
      s.id = 'stripe-script';
      s.type = 'text/javascript';
      s.src = 'https://js.stripe.com/v3/';
      window.document.body.appendChild(s);
    }

    this._stripe = Stripe(this.config.stripe!.pk);
    this._elements = this._stripe.elements();

    this._card = this._elements.create('card');
    this._card.mount(this.cardElement.nativeElement);
  }

  async getToken() {
    this.error = undefined;

    const { token, error } = await this._stripe.createToken(this._card);

    if (error) {
      this.error = error;
      return null;
    }
    return token!;
  }
}
