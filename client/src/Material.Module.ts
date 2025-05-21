import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
    exports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule,
        MatCardModule,
        MatDatepickerModule
    ]

})

export class MaterialModule { }