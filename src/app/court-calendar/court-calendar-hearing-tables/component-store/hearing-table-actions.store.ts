import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import {
  ExtendedJudicialRole,
  JurisdictionType,
  ListingService,
  SequenceHearing
} from '../../../core';
import { Actions, ofType } from '@ngrx/effects';
import { CourtCalendarActions } from '../../state/actions';
import { BaseHearingRowDataVM } from '../../model/hearing-table-renderer.vm';
import { mapHearingRowVmToSequencedHearings } from '../../utils/court-calendar-hearings-helper';
import { uniq } from 'lodash-es';
import { CourtRoomHearingTimeCalendar } from '../../model';
import { HearingDropdownActions } from '../shared/hearing-row-actions-dropdown/hearing-row-actions-dropdown.component';
import { OrganisationUnit } from '@cpp/reference-data';
import { CPPDate } from '../../../core/util';
import { sortTimeCalendarHearingsByMasterAndSequence } from '../../utils/view-model-getters';
import { getCourtCalendarManager } from '../../utils/courtroom-calendar-manager';

export interface MoveState {
  rowIdentifier: string;
  hearingId: string;
  hearingDate: string;
  rows: BaseHearingRowDataVM[];
}

export interface SectionAllocatedToState {
  courtRoomId: string;
  date: string;
  numOfHearingsAllocated?: number;
}

export interface SelectedHearingState {
  hearingId: string;
  hearingDateTime: string;
  judiciary?: ExtendedJudicialRole[];
  businessTypeAndSlot?: {
    businessTypeCode: string;
    courtScheduleId: string;
    session: { startTime: string; endTime: string };
  };
}

export interface PositionedHearingsState {
  positionedHearings: {
    hearingId: string;
    hearingDate: string;
  }[];
  showAlert?: boolean;
}

export interface HearingTableActionsState {
  selectedHearings?: SelectedHearingState[];
  moveState?: MoveState;
  sectionAllocatedTo?: SectionAllocatedToState;
  action?: HearingDropdownActions;
  sequencedHearings?: SequenceHearing[];
  positionedHearingsState?: PositionedHearingsState;
}

export interface MoveEvent {
  hearingToMoveIds?: string[];
  insertBeforeId?: string;
  insertafterId?: string;
}

export type AllocateMoveEvent = MoveEvent & {
  section: Record<string, any> & { courtRoomId?: string; date: string };
  judiciaryToallocate?: ExtendedJudicialRole[];
  group?: CourtRoomHearingTimeCalendar;
};

export interface SequenceEvent extends MoveEvent {
  courtType?: JurisdictionType;
  courtRoomId: string;
  courtCentre: OrganisationUnit;
  date: string;
  hearingDateTime: string;
}

@Injectable()
export class HearingTableActionsStore extends ComponentStore<HearingTableActionsState> {
  readonly actions$ = inject(Actions);
  readonly listingService = inject(ListingService);
  readonly cppDate = inject(CPPDate);
  courtRoomCalendarManager = getCourtCalendarManager();
  //-------------------------------------------------------------- SELECTORS-----------------------------------------------------------------------------------
  readonly moveState$ = this.select(({ moveState }) => moveState);
  readonly positionedHearingsState$ = this.select(
    ({ positionedHearingsState }) => positionedHearingsState
  );
  readonly onSequenceHearings$ = this.select(({ sequencedHearings }) => sequencedHearings);
  readonly sectionAllocatedTo$ = this.select(({ sectionAllocatedTo }) => sectionAllocatedTo);
  readonly currentAction$ = this.select(({ action }) => action).pipe(
    filter((action): action is HearingDropdownActions => !!action)
  );
  readonly selectedHearings$ = this.select(({ selectedHearings }) => selectedHearings);
  readonly onNavigateHearingActions$ = this.currentAction$.pipe(
    filter((action) => !!action && action !== 'move' && action !== 'unallocate'),
    switchMap((action) =>
      this.selectedHearings$.pipe(
        filter((hearings) => hearings?.length > 0),
        map((hearings) => ({ action, hearings: uniq(hearings.map(({ hearingId }) => hearingId)) }))
      )
    )
  );

  //-------------------------------------------------------------- SETTERS-----------------------------------------------------------------------------------------
  readonly setAction = this.updater((state, action: HearingDropdownActions) => ({
    ...state,
    action
  }));

  readonly setSequenceHearings = this.updater((state, sequencedHearings: SequenceHearing[]) => ({
    ...state,
    sequencedHearings
  }));

  readonly setSectionallocatedTo = this.updater(
    (state, sectionAllocatedTo: SectionAllocatedToState) => ({
      ...state,
      sectionAllocatedTo
    })
  );

  readonly resetMoveState = () =>
    this.patchState({
      moveState: undefined,
      sequencedHearings: undefined,
      action: undefined
    });

  readonly resetState = () =>
    this.patchState({
      selectedHearings: [],
      moveState: undefined,
      action: undefined,
      sequencedHearings: undefined,
      positionedHearingsState: undefined,
      sectionAllocatedTo: undefined
    });

  readonly setMoveState = this.updater((state, moveState: MoveState) => ({
    ...state,
    positionedHearingsState: undefined,
    sectionAllocatedTo: undefined,
    moveState
  }));

  readonly selectAllHearings = this.updater((state, hearings: SelectedHearingState[]) => ({
    ...state,
    selectedHearings: [...hearings],
    positionedHearingsState: undefined,
    sectionAllocatedTo: undefined
  }));

  readonly selectHearing = this.updater((state, hearing: SelectedHearingState) => {
    const selectedHearings = state.selectedHearings ?? [];
    const existingindex = selectedHearings.findIndex(
      ({ hearingDateTime, hearingId }) =>
        hearingId === hearing.hearingId && hearingDateTime === hearing.hearingDateTime
    );
    if (existingindex <= -1) {
      return {
        ...state,
        selectedHearings: [...selectedHearings, hearing],
        positionedHearingsState: undefined,
        sectionAllocatedTo: undefined
      };
    }
    selectedHearings.splice(existingindex, 1);
    return {
      ...state,
      selectedHearings: [...selectedHearings],
      positionedHearingsState: undefined,
      sectionAllocatedTo: undefined
    };
  });

  //----------------------------------------------------------------------EFFECTS----------------------------------------------------------------------------
  readonly sequenceHearings = this.effect((sequenceEvent$: Observable<SequenceEvent>) => {
    return sequenceEvent$.pipe(
      switchMap(({ insertBeforeId, insertafterId, hearingToMoveIds, courtRoomId, ...rest }) =>
        this.listingService
          .searchCourtCalendarHearings({
            startDate: rest?.date,
            endDate: rest?.date,
            jurisdictionType: rest?.courtType,
            courtCentreId: rest?.courtCentre?.id,
            allocated: true,
            useMaxPageSize: true,
            exactHearingStartDateTime: this.cppDate.toUtcISO(rest.hearingDateTime),
            courtRoomId
          })
          .pipe(
            map(({ hearings }) => {
              return sortTimeCalendarHearingsByMasterAndSequence(
                this.courtRoomCalendarManager.initialise({
                  courtRoom: rest.courtCentre.courtrooms?.find(({ id }) => courtRoomId === id),
                  date: rest.date,
                  hearings,
                  courtCentre: rest.courtCentre
                }).hearingViewModels
              );
            }),
            tap((hearingRows) => {
              this.setSequenceHearings(
                mapHearingRowVmToSequencedHearings(
                  hearingRows,
                  hearingToMoveIds,
                  insertBeforeId,
                  insertafterId
                )
              );
            })
          )
      ),
      switchMap(() =>
        this.actions$.pipe(
          ofType(CourtCalendarActions.triggerComponentOnSequenceOnly),
          withLatestFrom(this.onSequenceHearings$, this.moveState$),
          tapResponse(
            ([_, sequenceHearings, moveState]) => {
              if (sequenceHearings?.length > 0 && !!moveState) {
                this.patchState({
                  positionedHearingsState: {
                    positionedHearings: [
                      {
                        hearingId: moveState.hearingId,
                        hearingDate: moveState.hearingDate
                      }
                    ],
                    showAlert: true
                  },
                  moveState: undefined,
                  sequencedHearings: undefined,
                  action: undefined
                });
              } else {
                this.resetState();
              }
            },
            (error) => console.log(error)
          ),
          take(1)
        )
      )
    );
  });

  readonly setSectionAllocatedToSuccess = this.effect(
    (sectionAllocatedTo$: Observable<SectionAllocatedToState>) => {
      return sectionAllocatedTo$.pipe(
        switchMap((sectionAllocatedTo) =>
          this.actions$.pipe(
            ofType(CourtCalendarActions.triggerComponentOnSectionAllocated),
            withLatestFrom(this.selectedHearings$),
            tapResponse(
              ([{ failedHearingIds }, selectedHearingsState]) => {
                const allocatedHearings = selectedHearingsState.filter(
                  ({ hearingId }) => !failedHearingIds.includes(hearingId)
                );
                this.patchState({
                  moveState: undefined,
                  sequencedHearings: undefined,
                  action: undefined,
                  sectionAllocatedTo: {
                    ...sectionAllocatedTo,
                    numOfHearingsAllocated: allocatedHearings.length
                  },
                  positionedHearingsState: {
                    positionedHearings: allocatedHearings.map(({ hearingId }) => ({
                      hearingId,
                      hearingDate: sectionAllocatedTo.date
                    })),
                    showAlert: false
                  },
                  selectedHearings: []
                });
              },
              (error) => console.log(error)
            ),
            take(1)
          )
        )
      );
    }
  );

  constructor() {
    super({
      selectedHearings: [],
      moveState: undefined,
      action: undefined,
      sequencedHearings: undefined,
      positionedHearingsState: undefined,
      sectionAllocatedTo: undefined
    });
  }
}
