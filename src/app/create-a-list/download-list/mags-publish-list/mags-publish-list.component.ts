import { Component, computed, input, output } from '@angular/core';
import { PdkTypographyDirective, PdkListDirective } from '@cpp/pdk';
import { MagsPublishListItemComponent } from './mags-publish-list-item/mags-publish-list-item.component';
import { MagsPublishListVM } from '../../models/mags-publish-list.vm';
import { CourtListType } from '../../models/mags-publish-list.dto';
import { CppUserHasPermissionDirective, RequiredPermission } from '@cpp/users-groups';
import { MagsPublishDownloadLinkComponent } from './mags-publish-download-link/mags-publish-download-link.component';
import { getTimestampText } from './mags-publish-list-item/mags-publish-list-item.util';

@Component({
  selector: 'mags-publish-list, li[mags-publish-list]',
  templateUrl: './mags-publish-list.component.html',
  imports: [
    PdkTypographyDirective,
    PdkListDirective,
    MagsPublishListItemComponent,
    CppUserHasPermissionDirective,
    MagsPublishDownloadLinkComponent
  ]
})
export class MagsPublishListComponent {
  readonly CourtListType = CourtListType;
  isHmctsUser = input<boolean>(undefined);
  magPublishListPermissions = input<RequiredPermission>(undefined);
  statuses = input<MagsPublishListVM[]>([]);

  onMagsPublishList = output<{ listType: CourtListType }>();
  onDownloadMagsPublishedList = output<{ listType: CourtListType; fileId: string }>();

  readonly onlinePublicStatus = computed(() =>
    this.statuses().find(s => s.listType === CourtListType.ONLINE_PUBLIC)
  );
  readonly standardStatus = computed(() =>
    this.statuses().find(s => s.listType === CourtListType.STANDARD)
  );

  readonly hasDownload = computed(() => this.statuses().some(({ fileId }) => !!fileId));

  readonly statusTimeStampMap = computed(() => {
    const online = this.onlinePublicStatus();
    const standard = this.standardStatus();
    return {
      online: getTimestampText(online),
      standard: getTimestampText(standard)
    };
  });
}
