import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UrlEffects } from '../../../state/url/url.effects';
import { UrlEntry } from '../../../models/url/url.model';
import { CustomizeUrlDialogComponent } from '../../components/customize-url-dialog/customize-url-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UrlDialogService {
  constructor(private dialog: MatDialog, private urlEffects: UrlEffects) { }

  customizeUrl(url: UrlEntry): void {
    const dialogRef = this.dialog.open(CustomizeUrlDialogComponent, {
      width: '500px',
      data: url
    });

    dialogRef.afterClosed().subscribe((result: Partial<UrlEntry>) => {
      if (result) {
        const { shortId, expiresAt, clickLimit, tags } = result;
        let expiryDays: number | undefined;
        if (expiresAt) {
          const today = new Date();
          const expiry = new Date(expiresAt);
          expiryDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        this.urlEffects.updateUrl(
          url._id,
          expiryDays || 0,
          shortId || '',
          clickLimit || 0,
          tags || ''
        );
      }
    });
  }

}