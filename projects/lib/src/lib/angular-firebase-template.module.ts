import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MaterialModule } from "./material/material.module";
import { MinDirective } from "./core/directives/min.directive";
import { MaxDirective } from "./core/directives/max.directive";
import { LoadingDialogComponent } from "./loading-dialog/loading-dialog.component";
import { PaymentDialogComponent } from "./payment-dialog/payment-dialog.component";
import { Config, CONFIG } from "./core/types/config";

@NgModule({
  declarations: [
    MinDirective,
    MaxDirective,
    LoadingDialogComponent,
    PaymentDialogComponent
  ],
  imports: [CommonModule, FormsModule, FlexLayoutModule, MaterialModule],
  exports: [LoadingDialogComponent]
})
export class AngularFirebaseTemplateModule {
  static forRoot(config: Config): ModuleWithProviders {
    return {
      ngModule: AngularFirebaseTemplateModule,
      providers: [{ provide: CONFIG, useValue: config }]
    };
  }
}
