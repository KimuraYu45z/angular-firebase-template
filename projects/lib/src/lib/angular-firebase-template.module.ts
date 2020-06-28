import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Config, CONFIG } from './config';
import { MatDialogModule } from '@angular/material/dialog';
import { LoadingDialogModule } from './loading-dialog/loading-dialog.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, MatDialogModule, LoadingDialogModule],
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
