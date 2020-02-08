import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RippleCardComponent } from './ripple-card.component';

describe('RippleCardComponent', () => {
  let component: RippleCardComponent;
  let fixture: ComponentFixture<RippleCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RippleCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RippleCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
