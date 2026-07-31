import { Pipe, PipeTransform } from '@angular/core';
import { CourtListType, MagsPublishStatus } from '../models/mags-publish-list.dto';

const LIST_TYPE_DISPLAY_MAP: Partial<Record<CourtListType, string>> = {
  [CourtListType.STANDARD]: 'Standard list',
  [CourtListType.ONLINE_PUBLIC]: 'Online public list'
};

interface PublishStatusMessageInput {
  listType: CourtListType;
  publishStatus: MagsPublishStatus;
  downloadStatus: MagsPublishStatus;
  requestTimedOut?: boolean;
}

@Pipe({ name: 'publishStatusMessage' })
export class PublishStatusMessagePipe implements PipeTransform {
  transform(value: PublishStatusMessageInput | null | undefined): string {
    if (!value) {
      return '';
    }
    const { listType, publishStatus, downloadStatus, requestTimedOut } = value;
    const listTypeDisplay = LIST_TYPE_DISPLAY_MAP[listType] ?? listType;

    if (
      publishStatus === MagsPublishStatus.REQUESTED &&
      downloadStatus === MagsPublishStatus.REQUESTED &&
      !requestTimedOut
    ) {
      return `Request to publish ${listTypeDisplay} has been sent. Check back or wait to view status.`;
    }
    if (
      publishStatus === MagsPublishStatus.SUCCESSFUL &&
      downloadStatus === MagsPublishStatus.SUCCESSFUL
    ) {
      return `${listTypeDisplay} has been published and ready for download.`;
    }
    if (
      publishStatus === MagsPublishStatus.FAILED &&
      downloadStatus === MagsPublishStatus.SUCCESSFUL
    ) {
      return `${listTypeDisplay} has not been published. PDF has been generated and available for download.`;
    }
    if (
      publishStatus === MagsPublishStatus.SUCCESSFUL &&
      downloadStatus === MagsPublishStatus.FAILED
    ) {
      return `${listTypeDisplay} has been published. PDF has not been generated.`;
    }
    if (publishStatus === MagsPublishStatus.FAILED && downloadStatus === MagsPublishStatus.FAILED) {
      return `${listTypeDisplay} has not been published. PDF has not been generated.`;
    }
    if (
      requestTimedOut &&
      publishStatus === MagsPublishStatus.REQUESTED &&
      downloadStatus !== MagsPublishStatus.REQUESTED
    ) {
      return `Check back to view ${listTypeDisplay}'s publish status`;
    }
    if (
      requestTimedOut &&
      downloadStatus === MagsPublishStatus.REQUESTED &&
      publishStatus !== MagsPublishStatus.REQUESTED
    ) {
      return `Check back to view ${listTypeDisplay}'s PDF generation status`;
    }
    return `Check back to view ${listTypeDisplay}'s status`;
  }
}
