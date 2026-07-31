import { Component, computed, input, output } from '@angular/core';
import { PdkButton, PdkButtonDirective, PdkMarginDirective, PdkTagComponent } from '@cpp/pdk';
import { MagsPublishDownloadLinkComponent } from '../mags-publish-download-link/mags-publish-download-link.component';
import { MagsPublishListVM } from '../../../models/mags-publish-list.vm';
import {
  getPublishTag,
  getDownloadTag,
  getTimestampText,
  type MagsPublishListItemDisplay
} from './mags-publish-list-item.util';

@Component({
  selector: 'mags-publish-list-item, [mags-publish-list-item]',
  templateUrl: './mags-publish-list-item.component.html',
  imports: [
    PdkButton,
    PdkButtonDirective,
    PdkMarginDirective,
    PdkTagComponent,
    MagsPublishDownloadLinkComponent
  ],
  styles: [
    `
      .download-file {
        width: 245px;
        text-align: left;
      }
    `
  ]
})
export class MagsPublishListItemComponent {
  readonly label = input<string>('');
  readonly status = input<MagsPublishListVM | undefined>(undefined);

  readonly publish = output<void>();
  readonly download = output<string>();

  readonly statusRecord = computed((): MagsPublishListItemDisplay => {
    const status = this.status();
    return {
      publishTag: getPublishTag(status),
      downloadTag: getDownloadTag(status),
      timestampText: getTimestampText(status),
      fileId: status?.fileId
    };
  });
}
