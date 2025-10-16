import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../Material.Module';
import { ClickLimitValidatorDirective } from './directives/click-limit.validator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getCustomPaginatorIntl } from './utils/custom-paginator-intl';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { CapitalizePipe } from './pipes/capitalize.pipe';



@NgModule({
  providers: [
    { provide: MatPaginatorIntl, useFactory: getCustomPaginatorIntl }
  ],
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ClickLimitValidatorDirective,
    ClickOutsideDirective,
    CapitalizePipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ClickLimitValidatorDirective,
    ClickOutsideDirective,
    CapitalizePipe
  ]

})
export class SharedModule { }
