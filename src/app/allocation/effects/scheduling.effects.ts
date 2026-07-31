import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  getJudiciaryGroupTypes,
  getOrganisationUnits,
  getRotaBusinessTypesByJurisdiction,
  JudiciaryGroupType,
  JudiciaryTypeGroup,
  OrganisationUnit
} from '@cpp/reference-data';
import { isCrownCourt, isMagistratesCourt } from '@cpp/scheduling';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { last } from 'lodash-es';
import moment from 'moment';
import { Observable, of } from 'rxjs';
import { catchError, mapTo, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import {
  AllocateHearingMagsAction,
  ApiError,
  AppState,
  getReferenceDataHearingTypes,
  getScheduledHearingForAllocation,
  hasSplitHearingFromUnallocated,
  HearingSlotJudiciary,
  JudicialRole,
  JudiciaryGroupMapType,
  ListingService
} from '../../core';
import { AllocationActions } from '../actions';

@Injectable()
export class SchedulingEffects {
  constructor(
    private actions$: Actions,
    private listingService: ListingService,
    private router: Router,
    private store: Store<AppState>
  ) {}

  allocateHearing$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(AllocationActions.allocateHearing),
      withLatestFrom(this.store, this.store.select(hasSplitHearingFromUnallocated)),
      switchMap(
        ([
          {
            hearingSlotAllocations,
            hearingType: selectedHearingType,
            filters = {},
            redirectTo,
            sendNotificationToParties
          },
          state,
          splitHearingUnallocated
        ]) => {
          function getCourtCentreIdByOuCode(ouCode: string, units: OrganisationUnit[]): string {
            const matchedUnit = units.find(unit => unit.oucode === ouCode);
            return (matchedUnit && matchedUnit.id) || null;
          }

          const firstSlot = hearingSlotAllocations[0];
          const hearing = getScheduledHearingForAllocation(state);
          const { hasVideoLink = false, publicListNote = '' } = hearing;
          const organisationUnits = getOrganisationUnits(state);
          const judiciaryGroups = getJudiciaryGroupTypes(state);
          const startDate = firstSlot.hearingSlot.sessionDate;
          const endDate = last(hearingSlotAllocations).hearingSlot.sessionDate;
          const defaultCourtCentreId = getCourtCentreIdByOuCode(
            firstSlot.hearingSlot.ouCode,
            organisationUnits
          );
          const defaultCourtRoomId = firstSlot.hearingSlot.courtRoomId;

          const selectedCourt = organisationUnits.find(
            unit => unit.oucode === firstSlot.hearingSlot.ouCode
          );
          const { weekCommencingStartDate } = filters;

          const jurisdictionType = isMagistratesCourt(selectedCourt) ? 'MAGISTRATES' : 'CROWN';

          const rotaBusinessTypes = getRotaBusinessTypesByJurisdiction(jurisdictionType)(state);
          // Compute non-default days

          const nonDefaultDays = hearingSlotAllocations.map(
            ({ hearingSlot, hearingSlotTime, duration }) => {
              const rotaBusinessType = rotaBusinessTypes.find(
                ({ typeCode }) => typeCode === hearingSlot.businessType
              );
              // When rotaBusinessType is of duration type, then we apply any duration
              // forward by the allocation, and otherwise, the full duration of the
              // session. For any other businessType, it does not apply so we default
              // to 1.
              const defaultDuration = hearingSlot.courtSession === 'AD' ? 360 : 180;
              const hearingType = selectedHearingType ?? hearing.type;
              const refDataHearingType = getReferenceDataHearingTypes(state).find(
                ({ id }) => hearingType.id === id
              );
              const finalDuration =
                rotaBusinessType && rotaBusinessType.duration
                  ? duration || defaultDuration
                  : refDataHearingType
                    ? refDataHearingType.defaultDurationMin
                    : 1;
              return {
                startTime: hearingSlotTime,
                duration: finalDuration,
                courtScheduleId: hearingSlot.courtScheduleId,
                courtCentreId: getCourtCentreIdByOuCode(hearingSlot.ouCode, organisationUnits),
                session: hearingSlot.courtSession,
                oucode: hearingSlot.ouCode,
                courtRoomId: hearingSlot.courtRoomNumber,
                roomId: hearingSlot.courtRoomId,
                virtual: true
              };
            }
          );

          // Compute non-sitting days

          const nonSittingDays: string[] = [];

          let dateToCompare = moment(startDate);

          while (dateToCompare.isBefore(endDate)) {
            dateToCompare = dateToCompare.add(1, 'day');

            if (
              !hearingSlotAllocations.find(({ hearingSlot }) =>
                dateToCompare.isSame(hearingSlot.sessionDate)
              )
            ) {
              nonSittingDays.push(dateToCompare.format('YYYY-MM-DD'));
            }
          }

          // Compute prosecution cases to which the allocation applies

          const prosecutionCases =
            this.listingService.extractProsecutionCasesIdsFromHearing(hearing);

          // Compute judiciaries

          const judiciary = [firstSlot.hearingSlot]
            .reduce(
              (judiciaries: HearingSlotJudiciary[], slot) => [
                ...judiciaries,
                ...(slot.judiciaries || []).filter(
                  ({ judiciaryId }) => !judiciaries.find(judi => judiciaryId === judi.judiciaryId)
                )
              ],
              []
            )
            .map(
              ({ benchChairman, deputy, judiciaryId, judiciaryType }): JudicialRole => ({
                judicialId: judiciaryId,
                judicialRoleType: {
                  judiciaryType: this.getJudiciaryGroup(
                    judiciaryType,
                    judiciaryGroups
                  ) as JudiciaryTypeGroup
                },
                isBenchChairman: benchChairman,
                isDeputy: deputy
              })
            );
          const allocationEndDate = isCrownCourt(selectedCourt)
            ? (filters.endDate ?? endDate)
            : endDate;

          const dates = weekCommencingStartDate ? {} : { startDate, endDate: allocationEndDate };

          return this.listingService
            .allocateHearing(
              {
                courtCentreId: defaultCourtCentreId,
                courtRoomId: defaultCourtRoomId,
                judiciary,
                jurisdictionType,
                hearingId: hearing.id,
                hearingLanguage: hearing.hearingLanguage,
                nonDefaultDays,
                nonSittingDays,
                prosecutionCases,
                publicListNote,
                hasVideoLink,
                type: selectedHearingType ?? hearing.type,
                panel: firstSlot.hearingSlot.panel,
                sendNotificationToParties,
                ...dates,
                ...filters
              },
              splitHearingUnallocated
            )
            .pipe(
              mapTo(new AllocateHearingMagsAction({ hearingSlotAllocations })),
              tap(() => this.router.navigate(redirectTo)),
              catchError(err => of(new ApiError(err)))
            );
        }
      )
    )
  );

  private getJudiciaryGroup(judiciaryType: string, judiciaryGroups: JudiciaryGroupType[]) {
    const judiciary = judiciaryGroups.find(
      judi =>
        judi.judiciaryTypeDescription.toLowerCase().replace(/[\s_]/g, '') ===
        judiciaryType.toLowerCase().replace(/[\s_]/g, '')
    );

    if (!judiciary) {
      return judiciaryType;
    }

    const JudiciaryGroupMap: JudiciaryGroupMapType = {
      Judge: 'CIRCUIT_JUDGE',
      'District Judge': 'DISTRICT_JUDGE',
      'Deputy District Judge': 'DEPUTY_DISTRICT_JUDGE',
      Recorder: 'RECORDER',
      Magistrate: 'MAGISTRATE'
    };

    return JudiciaryGroupMap[judiciary.judiciaryGroup] || judiciaryType;
  }
}
