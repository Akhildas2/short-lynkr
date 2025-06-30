import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../Material.Module';
import { ClickLimitValidatorDirective } from './directives/click-limit.validator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getCustomPaginatorIntl } from './utils/custom-paginator-intl';



@NgModule({
  providers: [
    { provide: MatPaginatorIntl, useFactory: getCustomPaginatorIntl }
  ],
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ClickLimitValidatorDirective
  ],
  exports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ClickLimitValidatorDirective
  ]

})
export class SharedModule { }
