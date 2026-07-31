import { inject } from '@angular/core';
import { repeatUntil } from '@cpp/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
  WritableStateSource
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  delay,
  EMPTY,
  from,
  map,
  mergeMap,
  of,
  pipe,
  switchMap,
  tap,
  TimeoutError
} from 'rxjs';
import { CourtListPublishService } from '../../core/services/court-list-publish/court-list-publish.service';
import { magsPublishListStatusVmAdapter, MagsPublishListVM } from '../models';
import {
  CourtListType,
  MagsPublishListRequest,
  MagsPublishListStatusRequestParams,
  MagsPublishStatus,
  MagsPublishStatusDto
} from '../models/mags-publish-list.dto';
import { tapResponse } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { ApiError, AppState } from '../../core';
import FileSaver from 'file-saver';

interface MagsCourtListPublishState {
  _publishRequestIds: string[] | undefined;
  statuses: MagsPublishListVM[];
}

const initialState: MagsCourtListPublishState = {
  _publishRequestIds: undefined,
  statuses: []
};

const upsertPublishStatus = (state: MagsCourtListPublishState, newStatus: MagsPublishListVM) => ({
  statuses: [
    ...state.statuses.filter(s => s.publishRequestId !== newStatus.publishRequestId),
    newStatus
  ]
});

const pollPredicate = (
  data: MagsPublishStatusDto[],
  store: WritableStateSource<MagsCourtListPublishState>
) => {
  const dto = data[0];
  if (
    dto.publishStatus !== MagsPublishStatus.REQUESTED &&
    dto.fileStatus !== MagsPublishStatus.REQUESTED
  ) {
    return true;
  }
  // Still need to update the store with the latest status to ensure the UI reflects any status changes without displaying any alerts until the timeout period has been reached
  const viewModel = magsPublishListStatusVmAdapter(dto);
  patchState(store, state => upsertPublishStatus(state, { ...viewModel, alert: false }));
  return false;
};

const statusNeedsToBePolled = ({ publishStatus, downloadStatus }: MagsPublishListVM) =>
  publishStatus === MagsPublishStatus.REQUESTED || downloadStatus === MagsPublishStatus.REQUESTED;

const statusIsTerminal = (status: MagsPublishListVM) => status.finalised || status.requestTimedOut;

export const MagsCourtListPublishSignalStore = signalStore(
  withState(initialState),
  withProps(
    (_, service = inject(CourtListPublishService), globalStore = inject(Store<AppState>)) => ({
      _getPublishStatus: (payload: MagsPublishListStatusRequestParams) =>
        service.retrieveCourtListPublishStatus(payload),
      _publishCourtList: (request: MagsPublishListRequest) => service.publishCourtList(request),
      _downloadCourtListPdf: (fileId: string) => service.downloadCourtListPdf(fileId),
      _parentStore: globalStore
    })
  ),
  withMethods(store => ({
    _removeStatusByListType: (listType: CourtListType) => {
      const status = store.statuses().find(s => s.listType === listType);
      if (status) {
        patchState(store, state => ({
          statuses: state.statuses.filter(s => s.publishRequestId !== status.publishRequestId),
          _publishRequestIds: (state._publishRequestIds ?? []).filter(
            id => id !== status.publishRequestId
          )
        }));
      }
    },
    _hideTerminalStatusAlerts: () =>
      patchState(store, state => ({
        statuses: state.statuses.map(status =>
          status.alert && statusIsTerminal(status) ? { ...status, alert: false } : status
        )
      })),
    resetStore(): void {
      patchState(store, { statuses: [], _publishRequestIds: undefined });
    }
  })),
  withMethods(store => ({
    pollPublishStatuses: rxMethod<string[]>(
      pipe(
        switchMap(requestIds => {
          if (!requestIds || requestIds.length === 0) {
            return EMPTY;
          }
          return from(requestIds).pipe(
            delay(10000),
            tap(requestId => {
              const initialStatus = store
                .statuses()
                .find(status => status.publishRequestId === requestId);
              if (initialStatus) {
                patchState(store, state =>
                  upsertPublishStatus(state, { ...initialStatus, alert: false })
                );
              }
            }),
            mergeMap(courtListId => {
              return store._getPublishStatus({ courtListId }).pipe(
                repeatUntil(data => pollPredicate(data, store), { period: 10000, due: 30000 }),
                tap(([data]) => {
                  const viewModel = magsPublishListStatusVmAdapter(data);
                  patchState(store, state =>
                    upsertPublishStatus(state, { ...viewModel, alert: true, finalised: true })
                  );
                }),
                catchError(err => {
                  if (err instanceof TimeoutError) {
                    const currentStatus = store
                      .statuses()
                      .find(status => status.publishRequestId === courtListId);
                    patchState(store, state =>
                      upsertPublishStatus(state, {
                        ...currentStatus,
                        alert: true,
                        requestTimedOut: true
                      })
                    );
                    return EMPTY;
                  }
                  store._parentStore.dispatch(new ApiError(err));
                  return EMPTY;
                })
              );
            })
          );
        })
      )
    ),
    retrieveCourtListPublishStatus: rxMethod<MagsPublishListStatusRequestParams>(
      pipe(
        switchMap(request =>
          store._getPublishStatus(request).pipe(
            map(data => data.map(dto => magsPublishListStatusVmAdapter(dto))),
            tapResponse({
              next: statuses => {
                const statusesToPoll = statuses.filter(statusNeedsToBePolled);
                patchState(store, { statuses });
                if (statusesToPoll.length > 0) {
                  patchState(store, {
                    _publishRequestIds: statusesToPoll.map(
                      ({ publishRequestId }) => publishRequestId
                    )
                  });
                }
              },
              error: error => {
                store._parentStore.dispatch(new ApiError(error));
              }
            }),
            catchError(() => of([]))
          )
        )
      )
    ),
    publishCourtList: rxMethod<MagsPublishListRequest>(
      pipe(
        switchMap(request => {
          store._removeStatusByListType(request.courtListType);
          store._hideTerminalStatusAlerts();
          return store._publishCourtList(request).pipe(
            tapResponse({
              next: data => {
                const viewModel = magsPublishListStatusVmAdapter(data);
                patchState(store, state => ({
                  statuses: [...state.statuses, { ...viewModel, alert: true }],
                  _publishRequestIds: (state._publishRequestIds ?? []).reduce(
                    (acc, id) => {
                      if (
                        !state.statuses.some(
                          status => status.publishRequestId === id && statusIsTerminal(status)
                        )
                      ) {
                        acc.push(id);
                      }
                      return acc;
                    },
                    [viewModel.publishRequestId]
                  )
                }));
              },
              error: error => {
                store._parentStore.dispatch(new ApiError(error));
              }
            })
          );
        })
      )
    ),
    downloadMagsPublishedListPdf: rxMethod<{ fileId: string; listType: CourtListType }>(
      pipe(
        switchMap(({ fileId, listType }) =>
          store._downloadCourtListPdf(fileId).pipe(
            tapResponse({
              next: data =>
                FileSaver.saveAs(
                  data,
                  listType === CourtListType.ONLINE_PUBLIC
                    ? 'online_public_court_list.pdf'
                    : 'standard_court_list.pdf'
                ),
              error: error => store._parentStore.dispatch(new ApiError(error))
            })
          )
        )
      )
    )
  })),
  withHooks(store => ({
    onInit: () => {
      store.pollPublishStatuses(store._publishRequestIds);
    }
  }))
);
