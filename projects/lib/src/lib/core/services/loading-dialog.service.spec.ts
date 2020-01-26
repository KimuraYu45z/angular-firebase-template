import { TestBed } from '@angular/core/testing';

import { LoadingDialogService } from './loading-dialog.service';

describe('LoadingDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoadingDialogService = TestBed.get(LoadingDialogService);
    expect(service).toBeTruthy();
  });
});
