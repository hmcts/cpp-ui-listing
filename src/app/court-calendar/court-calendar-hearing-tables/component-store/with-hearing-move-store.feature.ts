import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, map, pipe, switchMap, take } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { uniq } from 'lodash-es';
import { JurisdictionType, ListingService, SequenceHearing } from '../../../core';
import { CPPDate } from '../../../core/util';
import { OrganisationUnit } from '@cpp/reference-data';
import { mapHearingRowVmToSequencedHearings } from '../../utils/court-calendar-hearings-helper';
import { sortTimeCalendarHearingsByMasterAndSequence } from '../../utils/view-model-getters';
import { getCourtCalendarManager } from '../../utils/courtroom-calendar-manager';
import { HearingDropdownActions } from '../shared/hearing-row-actions-dropdown/hearing-row-actions-dropdown.component';
import { BaseHearingRowDataVM } from '../../model/hearing-table-renderer.interfaces';
import { SelectedHearingState } from './with-hearing-selection-store.feature';
import { CourtCalendarActions } from '../../state';

export interface MoveState {
  rowIdentifier: string;
  hearingId: string;
  hearingDate: string;
  rows: BaseHearingRowDataVM[];
}

export interface PositionedHearingsState {
  positionedHearings: { hearingId: string; hearingDate: string }[];
  showAlert?: boolean;
}

export interface MoveEvent {
  hearingToMoveIds?: string[];
  insertBeforeId?: string;
  insertafterId?: string;
}

export interface SequenceEvent extends MoveEvent {
  courtType?: JurisdictionType;
  courtRoomId: string;
  courtCentre: OrganisationUnit;
  date: string;
  hearingDateTime: string;
}

interface HearingMoveState {
  moveState: MoveState | undefined;
  action: HearingDropdownActions | undefined;
  sequencedHearings: SequenceHearing[] | undefined;
  positionedHearingsState: PositionedHearingsState | undefined;
}

interface BaseDependencyState {
  selectedHearings: SelectedHearingState[];
}

interface BaseDependencyMethods extends Record<string, Function> {
  handleError?: (error: HttpErrorResponse) => void;
}

const initialState: HearingMoveState = {
  moveState: undefined,
  action: undefined,
  sequencedHearings: undefined,
  positionedHearingsState: undefined
};

export function withHearingMoveStore<_>() {
  return signalStoreFeature(
    {
      state: type<BaseDependencyState>(),
      methods: type<BaseDependencyMethods>()
    },
    withState<HearingMoveState>(initialState),
    withComputed(({ action, selectedHearings }) => ({
      currentAction: computed(() => action() ?? null),
      onNavigateHearingActions: computed(() => {
        const act = action();
        const hearings = selectedHearings();
        if (!act || act === 'move' || act === 'unallocate' || act === 'change-end-date') {
          return null;
        }
        if (!hearings?.length) {
          return null;
        }
        return { action: act, hearings: uniq(hearings.map(h => h.hearingId)) };
      })
    })),
    withMethods(
      (
        store,
        listingService = inject(ListingService),
        cppDate = inject(CPPDate),
        actions = inject(Actions)
      ) => {
        const courtRoomCalendarManager = getCourtCalendarManager();
        return {
          setAction: (act: HearingDropdownActions) => {
            patchState(store, { action: act });
          },
          setMoveState: (moveState: MoveState) => {
            patchState(store, { moveState, positionedHearingsState: undefined });
          },
          clearPositionedHearings: () => {
            patchState(store, { positionedHearingsState: undefined });
          },
          resetMoveState: () => {
            patchState(store, {
              moveState: undefined,
              sequencedHearings: undefined,
              action: undefined
            });
          },
          sequenceHearings: rxMethod<
            SequenceEvent & {
              onSequenceSuccess: () => void;
              onError?: (error: HttpErrorResponse) => void;
            }
          >(
            pipe(
              switchMap(
                ({
                  insertBeforeId,
                  insertafterId,
                  hearingToMoveIds,
                  courtRoomId,
                  onSequenceSuccess,
                  onError,
                  ...rest
                }) =>
                  listingService
                    .searchCourtCalendarHearings({
                      startDate: rest.date,
                      endDate: rest.date,
                      jurisdictionType: rest.courtType,
                      courtCentreId: rest.courtCentre?.id,
                      allocated: true,
                      useMaxPageSize: true,
                      exactHearingStartDateTime: cppDate.toUtcISO(rest.hearingDateTime),
                      courtRoomId
                    })
                    .pipe(
                      switchMap(({ hearings }) => {
                        const hearingRows = sortTimeCalendarHearingsByMasterAndSequence(
                          courtRoomCalendarManager.initialise({
                            courtRoom: rest.courtCentre.courtrooms?.find(
                              ({ id }) => courtRoomId === id
                            ),
                            date: rest.date,
                            hearings,
                            courtCentre: rest.courtCentre
                          }).hearingViewModels
                        );
                        const sequencedHearings = mapHearingRowVmToSequencedHearings(
                          hearingRows,
                          hearingToMoveIds,
                          insertBeforeId,
                          insertafterId
                        );

                        if (!sequencedHearings?.length) {
                          patchState(store, {
                            moveState: undefined,
                            sequencedHearings: undefined,
                            action: undefined
                          });
                          return EMPTY;
                        }

                        return listingService.sequenceHearingSync(sequencedHearings).pipe(
                          switchMap(() => {
                            const ms = store.moveState();
                            patchState(store, {
                              moveState: undefined,
                              sequencedHearings: undefined,
                              action: undefined
                            });
                            onSequenceSuccess();
                            return actions.pipe(
                              ofType(CourtCalendarActions.searchCourtCalendarSuccess),
                              take(1),
                              map(() => ms)
                            );
                          }),
                          tapResponse({
                            next: ({ hearingId, hearingDate }: MoveState) => {
                              patchState(store, {
                                positionedHearingsState: {
                                  positionedHearings: [{ hearingId, hearingDate }],
                                  showAlert: true
                                }
                              });
                            },
                            error: (err: HttpErrorResponse) => {
                              if (onError) {
                                onError(err);
                                return;
                              }
                              if (store.handleError) {
                                store.handleError(err);
                                return;
                              }
                              throw err;
                            }
                          })
                        );
                      })
                    )
              )
            )
          )
        };
      }
    )
  );
}
