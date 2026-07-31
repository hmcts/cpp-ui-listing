import { inject, Injectable } from '@angular/core';
import { CppHttp, mapObjectToHttpParams } from '@cpp/core';
import {
  MagsPublishListRequest,
  MagsPublishStatusDto,
  MagsPublishListStatusRequestParams
} from '../../../create-a-list/models';
import { map, Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CourtListPublishService {
  readonly cppHttp = inject(CppHttp);

  publishCourtList(request: MagsPublishListRequest): Observable<MagsPublishStatusDto> {
    return this.cppHttp
      .command({
        url: `/courtlistpublishing-service/api/court-list-publish/publish`,
        requestType: 'application/vnd.courtlistpublishing-service.publish.post+json',
        body: request
      })
      .pipe(
        map((response: HttpResponse<string>) => JSON.parse(response.body) as MagsPublishStatusDto)
      );
  }

  retrieveCourtListPublishStatus(
    payload: MagsPublishListStatusRequestParams
  ): Observable<MagsPublishStatusDto[]> {
    return this.cppHttp.query({
      url: `/courtlistpublishing-service/api/court-list-publish/publish-status`,
      requestType: 'application/vnd.courtlistpublishing-service.publish.get+json',
      params: mapObjectToHttpParams(payload),
      background: 'courtListId' in payload && !!payload.courtListId
    });
  }

  downloadCourtListPdf(fileId: string): Observable<Blob> {
    return this.cppHttp
      .query<Blob>({
        url: `/courtlistpublishing-service/api/files/download/${fileId}`,
        requestType: 'application/vnd.courtlistpublishing-service.files.download+json',
        responseType: 'blob'
      })
      .pipe(map((response) => new Blob([response], { type: response.type })));
  }
}
