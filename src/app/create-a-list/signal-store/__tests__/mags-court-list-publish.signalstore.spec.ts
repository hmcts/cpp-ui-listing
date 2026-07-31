import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import { MagsCourtListPublishSignalStore } from '../mags-court-list-publish.signalstore';
import { CourtListPublishService } from '../../../core/services/court-list-publish/court-list-publish.service';
import {
  CourtListType,
  MagsPublishStatus,
  MagsPublishStatusDto
} from '../../models/mags-publish-list.dto';
import { MagsPublishListRequest } from '../../models';
import { MagsPublishListVM } from '../../models/mags-publish-list.vm';

const mockPublishStatusDto: MagsPublishStatusDto = {
  courtListId: 'court-1',
  courtCentreId: 'centre-1',
  publishStatus: MagsPublishStatus.REQUESTED,
  fileStatus: MagsPublishStatus.REQUESTED,
  lastUpdated: '2026-01-01T00:00:00Z',
  courtListType: CourtListType.STANDARD,
  fileId: '123e4567-e89b-12d3-a456-426614174000',
  publishDate: '2026-01-01'
};

const mockPublishStatusDtoSuccessful: MagsPublishStatusDto = {
  ...mockPublishStatusDto,
  publishStatus: MagsPublishStatus.SUCCESSFUL,
  fileStatus: MagsPublishStatus.SUCCESSFUL
};

const expectedStatusFromRetrieve: MagsPublishListVM = {
  publishRequestId: 'court-1',
  courtCentreId: 'centre-1',
  publishStatus: MagsPublishStatus.REQUESTED,
  downloadStatus: MagsPublishStatus.REQUESTED,
  lastUpdated: '2026-01-01T00:00:00Z',
  fileId: '123e4567-e89b-12d3-a456-426614174000',
  listType: CourtListType.STANDARD
};

const expectedStatusFromPublish: MagsPublishListVM = {
  publishRequestId: 'court-1',
  courtCentreId: 'centre-1',
  publishStatus: MagsPublishStatus.SUCCESSFUL,
  downloadStatus: MagsPublishStatus.SUCCESSFUL,
  lastUpdated: '2026-01-01T00:00:00Z',
  fileId: '123e4567-e89b-12d3-a456-426614174000',
  listType: CourtListType.STANDARD,
  alert: true
};

describe('MagsCourtListPublishSignalStore', () => {
  let store: InstanceType<typeof MagsCourtListPublishSignalStore>;
  let mockCourtListPublishService: jest.Mocked<
    Pick<CourtListPublishService, 'retrieveCourtListPublishStatus' | 'publishCourtList'>
  >;
  let dispatchSpy: jest.Mock;

  beforeEach(() => {
    dispatchSpy = jest.fn();
    mockCourtListPublishService = {
      retrieveCourtListPublishStatus: jest.fn().mockReturnValue(of([mockPublishStatusDto])),
      publishCourtList: jest.fn().mockReturnValue(of(mockPublishStatusDtoSuccessful))
    };

    TestBed.configureTestingModule({
      providers: [
        MagsCourtListPublishSignalStore,
        {
          provide: CourtListPublishService,
          useValue: mockCourtListPublishService
        },
        {
          provide: Store,
          useValue: { dispatch: dispatchSpy }
        }
      ],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(MagsCourtListPublishSignalStore);
  });

  it('should have initial state', () => {
    expect(store.statuses()).toEqual([]);
  });

  it('should reset store', fakeAsync(() => {
    store.retrieveCourtListPublishStatus({
      courtCentreId: 'centre-1',
      publishDate: '2026-01-01',
      courtListType: CourtListType.ONLINE_PUBLIC
    });
    flush();
    expect(store.statuses()).toEqual([expectedStatusFromRetrieve]);
    store.resetStore();
    expect(store.statuses()).toEqual([]);
  }));

  it('should retrieve court list publish status and set statuses', fakeAsync(() => {
    store.retrieveCourtListPublishStatus({
      courtCentreId: 'centre-1',
      publishDate: '2026-01-01',
      courtListType: CourtListType.ONLINE_PUBLIC
    });
    flush();
    expect(mockCourtListPublishService.retrieveCourtListPublishStatus).toHaveBeenCalledWith({
      courtCentreId: 'centre-1',
      publishDate: '2026-01-01',
      courtListType: CourtListType.ONLINE_PUBLIC
    });
    expect(store.statuses()).toEqual([expectedStatusFromRetrieve]);
  }));

  it('should set statuses when retrieved status is SUCCESSFUL', fakeAsync(() => {
    mockCourtListPublishService.retrieveCourtListPublishStatus.mockReturnValue(
      of([mockPublishStatusDtoSuccessful])
    );

    store.retrieveCourtListPublishStatus({
      courtCentreId: 'centre-1',
      publishDate: '2026-01-01',
      courtListType: CourtListType.ONLINE_PUBLIC
    });
    flush();
    expect(store.statuses()).toEqual([
      {
        publishRequestId: 'court-1',
        courtCentreId: 'centre-1',
        publishStatus: MagsPublishStatus.SUCCESSFUL,
        downloadStatus: MagsPublishStatus.SUCCESSFUL,
        lastUpdated: '2026-01-01T00:00:00Z',
        fileId: '123e4567-e89b-12d3-a456-426614174000',
        listType: CourtListType.STANDARD
      }
    ]);
  }));

  it('should dispatch ApiError when retrieve fails', fakeAsync(() => {
    const err = new Error('retrieve failed');
    mockCourtListPublishService.retrieveCourtListPublishStatus.mockReturnValue(
      throwError(() => err)
    );

    store.retrieveCourtListPublishStatus({
      courtCentreId: 'centre-1',
      publishDate: '2026-01-01',
      courtListType: CourtListType.ONLINE_PUBLIC
    });
    flush();
    expect(dispatchSpy).toHaveBeenCalled();
  }));

  it('should publish court list and add status with alert true', fakeAsync(() => {
    const request: MagsPublishListRequest = {
      courtCentreId: 'centre-1',
      startDate: '2026-01-01',
      endDate: '2026-01-01',
      courtListType: CourtListType.STANDARD
    };

    store.publishCourtList(request);
    flush();
    expect(mockCourtListPublishService.publishCourtList).toHaveBeenCalledWith(request);
    expect(store.statuses()).toEqual([expectedStatusFromPublish]);
  }));

  it('should remove existing status by list type when publishing same type', fakeAsync(() => {
    mockCourtListPublishService.retrieveCourtListPublishStatus.mockReturnValue(
      of([
        {
          ...mockPublishStatusDtoSuccessful,
          courtListId: 'old-1',
          courtListType: CourtListType.STANDARD
        }
      ])
    );

    store.retrieveCourtListPublishStatus({
      courtCentreId: 'centre-1',
      publishDate: '2026-01-01',
      courtListType: CourtListType.STANDARD
    });
    flush();
    const expectedAfterRetrieve: MagsPublishListVM = {
      publishRequestId: 'old-1',
      courtCentreId: 'centre-1',
      publishStatus: MagsPublishStatus.SUCCESSFUL,
      downloadStatus: MagsPublishStatus.SUCCESSFUL,
      lastUpdated: '2026-01-01T00:00:00Z',
      fileId: '123e4567-e89b-12d3-a456-426614174000',
      listType: CourtListType.STANDARD
    };
    expect(store.statuses()).toEqual([expectedAfterRetrieve]);

    mockCourtListPublishService.publishCourtList.mockReturnValue(
      of({
        ...mockPublishStatusDtoSuccessful,
        courtListId: 'new-1',
        courtListType: CourtListType.STANDARD
      })
    );

    store.publishCourtList({
      courtCentreId: 'centre-1',
      startDate: '2026-01-01',
      endDate: '2026-01-01',
      courtListType: CourtListType.STANDARD
    });
    flush();
    const expectedAfterPublish: MagsPublishListVM = {
      ...expectedStatusFromPublish,
      publishRequestId: 'new-1'
    };
    expect(store.statuses()).toEqual([expectedAfterPublish]);
  }));

  it('should dispatch ApiError when publish fails', fakeAsync(() => {
    const err = new Error('publish failed');
    mockCourtListPublishService.publishCourtList.mockReturnValue(throwError(() => err));

    store.publishCourtList({
      courtCentreId: 'centre-1',
      startDate: '2026-01-01',
      endDate: '2026-01-01',
      courtListType: CourtListType.STANDARD
    });
    flush();
    expect(dispatchSpy).toHaveBeenCalled();
  }));
});
