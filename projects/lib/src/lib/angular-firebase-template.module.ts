import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './core/modules/material/material.module';
import { MinDirective } from './core/directives/min.directive';
import { MaxDirective } from './core/directives/max.directive';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { Config, CONFIG } from './core/types/config';
import { PaymentFormComponent } from './payment-form/payment-form.component';

@NgModule({
  declarations: [
    MinDirective,
    MaxDirective,
    LoadingDialogComponent,
    PaymentFormComponent,
  ],
  imports: [CommonModule, FormsModule, FlexLayoutModule, MaterialModule],
  exports: [
    MinDirective,
    MaxDirective,
    LoadingDialogComponent,
    PaymentFormComponent,
  ],
})
export class AngularFirebaseTemplateModule {
  static forRoot(
    config: Config,
  ): ModuleWithProviders<AngularFirebaseTemplateModule> {
    return {
      ngModule: AngularFirebaseTemplateModule,
      providers: [{ provide: CONFIG, useValue: config }],
    };
  }
}
