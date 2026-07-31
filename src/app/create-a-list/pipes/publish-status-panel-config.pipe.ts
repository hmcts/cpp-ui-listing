import { Pipe, PipeTransform } from '@angular/core';
import { MagsPublishStatus } from '../models/mags-publish-list.dto';

export interface PublishStatusPanelConfig {
  icon: 'tick' | 'warn';
  type: 'success' | 'invalid' | 'notice';
}

interface PublishStatusPanelConfigInput {
  publishStatus: MagsPublishStatus;
  downloadStatus: MagsPublishStatus;
  requestTimedOut?: boolean;
}

@Pipe({ name: 'publishStatusPanelConfig' })
export class PublishStatusPanelConfigPipe implements PipeTransform {
  private readonly warnConfig: PublishStatusPanelConfig = { icon: 'warn', type: 'invalid' };
  private readonly noticeConfig: PublishStatusPanelConfig = { icon: 'warn', type: 'notice' };
  private readonly successConfig: PublishStatusPanelConfig = { icon: 'tick', type: 'success' };

  transform(value: PublishStatusPanelConfigInput | null | undefined): PublishStatusPanelConfig {
    if (!value) {
      return this.successConfig;
    }
    const { publishStatus, downloadStatus, requestTimedOut } = value;
    const isFailedWithPdf =
      publishStatus === MagsPublishStatus.FAILED && downloadStatus === MagsPublishStatus.SUCCESSFUL;
    const isSuccessWithoutPdf =
      publishStatus === MagsPublishStatus.SUCCESSFUL && downloadStatus === MagsPublishStatus.FAILED;
    const isBothFailed =
      publishStatus === MagsPublishStatus.FAILED && downloadStatus === MagsPublishStatus.FAILED;
    if (isFailedWithPdf || isSuccessWithoutPdf || isBothFailed) {
      return this.warnConfig;
    }
    if (requestTimedOut) {
      return this.noticeConfig;
    }
    return this.successConfig;
  }
}
