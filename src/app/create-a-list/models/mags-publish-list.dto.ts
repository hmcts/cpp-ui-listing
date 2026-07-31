import { Observable } from 'rxjs';

export interface MagsPublishStatusDto {
  courtListId: string;
  courtCentreId: string;
  publishStatus: MagsPublishStatus;
  fileStatus: MagsPublishStatus;
  courtListType: CourtListType;
  lastUpdated: string;
  fileId?: string;
  fileErrorMessage?: string;
  publishErrorMessage?: string;
  publishDate: string;
}

export enum MagsPublishStatus {
  REQUESTED = 'REQUESTED',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED'
}

export enum CourtListType {
  STANDARD = 'STANDARD',
  ALPHABETICAL = 'ALPHABETICAL',
  PUBLIC = 'PUBLIC',
  BENCH = 'BENCH',
  JUDGE = 'JUDGE',
  USHERS_CROWN = 'USHERS_CROWN',
  USHERS_MAGISTRATE = 'USHERS_MAGISTRATE',
  ONLINE_PUBLIC = 'ONLINE_PUBLIC',
  PRISON = 'PRISON',
  WARN = 'WARN',
  DRAFT = 'DRAFT',
  FINAL = 'FINAL',
  FIRM = 'FIRM'
}

export interface MagsPublishListRequest {
  courtCentreId: string;
  startDate: string;
  endDate: string;
  courtListType: CourtListType;
}

export interface DownloadListRequest extends MagsPublishListRequest {
  courtRoomId: string;
  restricted?: boolean;
}

export type MagsPublishListStatusRequestParams =
  | { courtListId: string }
  | { courtCentreId: string; publishDate: string; courtListType?: CourtListType };

export interface MagsPublichListStatusRequestOverload {
  (request: MagsPublishListStatusRequestParams): Observable<MagsPublishStatusDto[]>;
}
