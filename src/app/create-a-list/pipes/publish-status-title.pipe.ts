import { Pipe, PipeTransform } from '@angular/core';
import { MagsPublishStatus } from '../models/mags-publish-list.dto';

interface PublishStatusTitleInput {
  publishStatus: MagsPublishStatus;
  downloadStatus: MagsPublishStatus;
  requestTimedOut?: boolean;
}

@Pipe({ name: 'publishStatusTitle' })
export class PublishStatusTitlePipe implements PipeTransform {
  transform(value: PublishStatusTitleInput | null | undefined): string {
    if (!value) {
      return '';
    }
    const { publishStatus, downloadStatus, requestTimedOut } = value;
    if (
      publishStatus === MagsPublishStatus.REQUESTED &&
      downloadStatus === MagsPublishStatus.REQUESTED &&
      !requestTimedOut
    ) {
      return 'Request sent successfully';
    }
    if (
      publishStatus === MagsPublishStatus.SUCCESSFUL &&
      downloadStatus === MagsPublishStatus.SUCCESSFUL
    ) {
      return 'Publish successful';
    }
    if (
      publishStatus === MagsPublishStatus.FAILED &&
      downloadStatus === MagsPublishStatus.SUCCESSFUL
    ) {
      return 'Publish failed and PDF generated';
    }
    if (
      publishStatus === MagsPublishStatus.SUCCESSFUL &&
      downloadStatus === MagsPublishStatus.FAILED
    ) {
      return 'Publish successful and PDF not generated';
    }
    if (publishStatus === MagsPublishStatus.FAILED && downloadStatus === MagsPublishStatus.FAILED) {
      return 'Publish unsuccessful and PDF not generated';
    }
    if (
      requestTimedOut &&
      publishStatus === MagsPublishStatus.REQUESTED &&
      downloadStatus !== MagsPublishStatus.REQUESTED
    ) {
      return 'Publish request is still being processed';
    }
    if (
      requestTimedOut &&
      downloadStatus === MagsPublishStatus.REQUESTED &&
      publishStatus !== MagsPublishStatus.REQUESTED
    ) {
      return 'PDF generation is still being processed';
    }
    return 'Your request is being processed';
  }
}
