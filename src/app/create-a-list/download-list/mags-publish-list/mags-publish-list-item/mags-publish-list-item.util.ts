import { formatDate } from '@angular/common';
import { MagsPublishListVM } from '../../../models/mags-publish-list.vm';
import { MagsPublishStatus } from '../../../models/mags-publish-list.dto';

export interface StatusTag {
  label: string;
  color: string;
}

export interface MagsPublishListItemDisplay {
  publishTag?: StatusTag;
  downloadTag?: StatusTag;
  timestampText?: string;
  fileId?: string;
}

const PUBLISH_STATUS_TAGS: Partial<Record<MagsPublishStatus, StatusTag>> = {
  [MagsPublishStatus.REQUESTED]: { label: 'Requested', color: 'blue' },
  [MagsPublishStatus.SUCCESSFUL]: { label: 'Published', color: 'green' },
  [MagsPublishStatus.FAILED]: { label: 'Publish failed', color: 'red' }
};

const DOWNLOAD_STATUS_TAGS: Partial<Record<MagsPublishStatus, StatusTag>> = {
  [MagsPublishStatus.SUCCESSFUL]: { label: 'PDF generated', color: 'green' },
  [MagsPublishStatus.FAILED]: { label: 'PDF not generated', color: 'red' }
};

export function getPublishTag(status: MagsPublishListVM | null): StatusTag | undefined {
  return status ? PUBLISH_STATUS_TAGS[status.publishStatus] : undefined;
}

export function getDownloadTag(status: MagsPublishListVM | null): StatusTag | undefined {
  if (!status || status.downloadStatus === MagsPublishStatus.REQUESTED) {
    return undefined;
  }
  return DOWNLOAD_STATUS_TAGS[status.downloadStatus];
}

export function getTimestampText(status: MagsPublishListVM | null): string | undefined {
  if (!status?.lastUpdated) return undefined;
  const { publishStatus, downloadStatus } = status;
  if (
    publishStatus === MagsPublishStatus.REQUESTED ||
    (publishStatus === MagsPublishStatus.FAILED && downloadStatus === MagsPublishStatus.FAILED)
  ) {
    return undefined;
  }
  const date = formatDate(status.lastUpdated, 'd MMMM y, h:mm a', 'en-GB');
  if (publishStatus === MagsPublishStatus.SUCCESSFUL) {
    return `Published on ${date}`;
  }
  if (downloadStatus === MagsPublishStatus.SUCCESSFUL) {
    return `Generated on ${date}`;
  }
  return undefined;
}
