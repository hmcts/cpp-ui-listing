import { CourtListType, MagsPublishStatus } from './mags-publish-list.dto';

export interface MagsPublishListVM {
  publishRequestId: string;
  courtCentreId: string;
  publishStatus: MagsPublishStatus;
  downloadStatus: MagsPublishStatus;
  lastUpdated: string;
  fileId?: string;
  listType: CourtListType;
  alert?: boolean;
  requestTimedOut?: boolean;
  finalised?: boolean;
}
