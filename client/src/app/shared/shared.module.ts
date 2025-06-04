import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomizeUrlDialogComponent } from './components/customize-url-dialog/customize-url-dialog.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../Material.Module';
import { ClickLimitValidatorDirective } from './directives/click-limit.validator';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    CustomizeUrlDialogComponent,
    ClickLimitValidatorDirective
  ],
  exports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    CustomizeUrlDialogComponent,
    ClickLimitValidatorDirective
  ]

})
export class SharedModule { }
