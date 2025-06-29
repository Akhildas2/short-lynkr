import { Injectable } from '@angular/core';
import { SnackbarService } from "../snackbar/snackbar.service";
import { UrlEffects } from "../../../state/url/url.effects";
import { extractShortId } from "../../utils/url.utils";

@Injectable({
  providedIn: 'root'
})

export class UrlService {

  constructor(private snackbar: SnackbarService, private urlEffects: UrlEffects) { }

  async openShortUrl(shortUrl: string): Promise<void> {
    const shortId = extractShortId(shortUrl);
    if (!shortId) {
      this.snackbar.showError('Invalid short URL.');
      return;
    }

    const originalUrl = await this.urlEffects.redirectToOriginalUrl(shortId);
    if (originalUrl) {
      window.open(originalUrl, '_blank');
    }
  }

}