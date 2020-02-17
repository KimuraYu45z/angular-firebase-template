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
  ) {}

  ngOnInit() {
    if (!this.config.stripe) {
      throw new ErrorStripeConfigUndefined();
    }
    this._stripe = Stripe(this.config.stripe.pk);
    this._elements = this._stripe.elements();

    this._card = this._elements.create('card', { hidePostalCode: true });
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
