import {
  MagsPublishStatusDto,
  MagsPublishStatus,
  MagsPublishListRequest,
  CourtListType,
  MagsPublishListStatusRequestParams
} from './mags-publish-list.dto';
import { MagsPublishListVM } from './mags-publish-list.vm';

export function magsPublishListStatusVmAdapter(dto: MagsPublishStatusDto): MagsPublishListVM {
  return {
    publishRequestId: dto.courtListId,
    courtCentreId: dto.courtCentreId,
    publishStatus: dto.publishStatus,
    downloadStatus: dto.fileStatus,
    lastUpdated: dto.lastUpdated,
    fileId: dto.fileId,
    listType: dto.courtListType
  };
}

export {
  MagsPublishStatusDto,
  MagsPublishStatus,
  MagsPublishListVM,
  MagsPublishListRequest,
  CourtListType,
  MagsPublishListStatusRequestParams
};
