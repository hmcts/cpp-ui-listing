import { LowerCasePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  PdkLinkDirective,
  PdkMarginDirective,
  PdkTypographyDirective,
  PdkTextColorDirective
} from '@cpp/pdk';

@Component({
  selector: 'mags-publish-download-link, [mags-publish-download-link]',
  templateUrl: './mags-publish-download-link.component.html',
  imports: [
    PdkLinkDirective,
    PdkMarginDirective,
    PdkTypographyDirective,
    PdkTextColorDirective,
    LowerCasePipe
  ]
})
export class MagsPublishDownloadLinkComponent {
  readonly fileId = input<string | undefined>(undefined);
  readonly timestamp = input<string | undefined>(undefined);
  readonly label = input<string>('');

  readonly download = output<string>();
}
