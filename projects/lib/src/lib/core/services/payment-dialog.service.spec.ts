import { TestBed } from '@angular/core/testing';

import { PaymentDialogService } from './payment-dialog.service';

describe('PaymentDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PaymentDialogService = TestBed.get(PaymentDialogService);
    expect(service).toBeTruthy();
  });
});
