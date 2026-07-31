import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../../core/actions/api';
import { CourtCalendarActions } from '../actions';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import {
  HearingWithSelectedCourtCentre,
  ChangeJudicaryForHearingsSuccessAction,
  JudicialRole,
  JurisdictionType,
  ListingService,
  PaginatedHearingResponse,
  SelectedFilterOptions,
  getReferenceDataHearingTypeById
} from '../../../core';
import {
  getAllocateProsecutionCases,
  mapResponseToPaginatedHearingMap
} from '../../utils/court-calendar-hearings-helper';
import {
  getSearchParams,
  isMagistratesCourt,
  loadListingNotes,
  resetHearingSlots
} from '@cpp/scheduling';
import { getOrganisationUnits } from '@cpp/reference-data';
import { Router } from '@angular/router';
import {
  generateNonDefaultDays,
  getPermissionAndNotificationHandler
} from './court-calendar.effect.utils';
import { select, Store } from '@ngrx/store';
import { AllocateHearingCase } from '../../model';

import { last } from 'lodash-es';
import { getCourtCalendarFilters, getSelectedHearing } from '../selectors';
import { formatDate } from '@angular/common';

export const searchCourtCalendarsEffect = createEffect(
  (actions$ = inject(Actions), listingService = inject(ListingService)) => {
    return actions$.pipe(
      ofType(CourtCalendarActions.searchCourtCalendar),
      switchMap(
        ({
          filterOptions: {
            courtType,
            courtCentre,
            pageNumber,
            endDate,
            hearingType,
            ...restOfParams
          }
        }) => {
          const hearingsEndDate = !endDate ? restOfParams.startDate : endDate;
          const hasSession =
            !!restOfParams.courtSession && restOfParams.courtSession.toLocaleLowerCase() !== 'any';
          const payload = {
            ...restOfParams,
            jurisdictionType: courtType,
            ouCode: !!restOfParams.businessType || hasSession ? courtCentre.oucode : null,
            pageNumber,
            courtCentreId: courtCentre?.id,
            endDate: hearingsEndDate,
            hearingTypeId: hearingType?.id,
            allocated: true
          } as SelectedFilterOptions;

          return listingService.searchCourtCalendarHearings(payload).pipe(
            map(({ hearings, pageCount, results, notes }: PaginatedHearingResponse) => ({
              payload: mapResponseToPaginatedHearingMap(
                { hearings, pageCount, results },
                restOfParams.startDate,
                hearingsEndDate,
                pageNumber
              ),
              notes
            })),
            switchMap(({ payload, notes }) => {
              return [
                CourtCalendarActions.searchCourtCalendarSuccess({ payload }),
                loadListingNotes({ notes }),
                resetHearingSlots()
              ];
            }),
            catchError((error: HttpErrorResponse) => of(new ApiError(error)))
          );
        }
      )
    );
  },
  { functional: true }
);

export const changeJudiciaryForHearings = createEffect(
  (actions$ = inject(Actions), router = inject(Router), listingService = inject(ListingService)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.changeHearingsJudiciaryAction),
      switchMap(action => {
        const { hearings, judiciary: judiciaries, filterOptions } = action;
        const courtRoom = filterOptions.courtCentre.courtrooms.find(
          cr => cr.id === filterOptions.courtRoomId
        );
        const notificationAndPermissionHandler$ = getPermissionAndNotificationHandler(
          hearings,
          judiciaries,
          listingService
        );

        return listingService
          .changeJudiciaryForHearings({
            hearings: hearings.map(h => h.id),
            judiciary:
              judiciaries && judiciaries.map(({ judicialMember, ...rest }) => rest as JudicialRole)
          })
          .pipe(
            switchMap(() =>
              notificationAndPermissionHandler$.pipe(
                switchMap(() => [
                  new ChangeJudicaryForHearingsSuccessAction(action),
                  CourtCalendarActions.setAlertMessage({
                    successAlert: `Judiciary details have been updated for ${courtRoom.courtroomName}.`
                  })
                ]),
                tap(() => router.navigate(['court-calendar'])),
                catchError(err => of(new ApiError(err)))
              )
            )
          );
      })
    ),
  { functional: true }
);

export const setCaseNotesEffect = createEffect(
  (actions$ = inject(Actions), listingService = inject(ListingService)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.setCaseNotesForCase),
      switchMap(({ caseId }) =>
        listingService.getCaseNotes(caseId, true).pipe(
          map(caseNotesForCase =>
            CourtCalendarActions.setCaseNotesForCaseSuccess({ caseNotes: caseNotesForCase })
          ),
          catchError(err => of(new ApiError(err)))
        )
      )
    ),
  { functional: true }
);

export const updateSelectedHearingEffect = createEffect(
  (actions$ = inject(Actions), listingService = inject(ListingService), router = inject(Router)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.updateSelectedHearingData),
      switchMap(({ originHearing, updatedHearing }) => {
        const { judiciary, ...values } = updatedHearing as HearingWithSelectedCourtCentre;

        const notificationAndPermissionHandler$ = getPermissionAndNotificationHandler(
          [originHearing as HearingWithSelectedCourtCentre],
          judiciary,
          listingService,
          [updatedHearing]
        );

        return forkJoin([
          listingService.updateAllocatedHearing({
            ...values,
            judiciary
          }),
          notificationAndPermissionHandler$
        ]).pipe(
          switchMap(() => [
            CourtCalendarActions.updateSelectedHearingDataSuccess(),
            CourtCalendarActions.setSelectedHearingData({ selectedHearing: null }),
            CourtCalendarActions.setAlertMessage({
              successAlert: 'The hearing details have been updated'
            })
          ]),
          tap(() => {
            router.navigate(['/court-calendar']);
          }),
          catchError(err => of(new ApiError(err)))
        );
      })
    ),
  { functional: true }
);

export const removeHearingEffect = createEffect(
  (actions$ = inject(Actions), listingService = inject(ListingService), router = inject(Router)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.removeSelectedHearing),
      switchMap(({ payload }) =>
        listingService.removeHearing(payload).pipe(
          switchMap(() => [
            CourtCalendarActions.removeSelectedHearingSuccess(),
            CourtCalendarActions.setSelectedHearingData({ selectedHearing: null }),
            CourtCalendarActions.setAlertMessage({
              successAlert: 'The hearing has been removed'
            })
          ]),
          tap(() => {
            router.navigate(['/court-calendar']);
          }),
          catchError(err => of(new ApiError(err)))
        )
      )
    ),
  { functional: true }
);

export const changeHearingEndDateEffect = createEffect(
  (actions$ = inject(Actions), listingService = inject(ListingService), store = inject(Store)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.moveHearingEndDate),
      withLatestFrom(store.pipe(select(getCourtCalendarFilters))),
      switchMap(([{ hearing, newEndDate }, filterOptions]) => {
        const previousEndDate = hearing.endDate;
        return listingService
          .updateAllocatedHearing({
            ...hearing,
            endDate: newEndDate
          } as HearingWithSelectedCourtCentre)
          .pipe(
            switchMap(() => [
              CourtCalendarActions.setAlertMessage({
                successAlert: `Hearing date successfully changed from ${formatDate(previousEndDate, 'd MMMM yyyy', 'en-GB')} to ${formatDate(newEndDate, 'd MMMM yyyy', 'en-GB')}`
              }),
              CourtCalendarActions.searchCourtCalendar({ filterOptions })
            ]),
            catchError(err => of(new ApiError(err)))
          );
      })
    ),
  { functional: true }
);

export const splitHearingEffect = createEffect(
  (action$ = inject(Actions), listingService = inject(ListingService), router = inject(Router)) =>
    action$.pipe(
      ofType(CourtCalendarActions.splitHearings),
      switchMap(({ originHearing, updatedHearing }) => {
        const {
          judiciary,
          hasVideoLink = false,
          publicListNote = '',
          ...values
        } = updatedHearing as HearingWithSelectedCourtCentre;
        const { listedCases } = originHearing;
        const prosecutionCases: AllocateHearingCase[] = getAllocateProsecutionCases(listedCases);

        const notificationAndPermissionHandler$ = getPermissionAndNotificationHandler(
          [originHearing as HearingWithSelectedCourtCentre],
          judiciary,
          listingService,
          [updatedHearing]
        );

        return forkJoin([
          listingService.allocateHearing({
            courtCentreId: values.courtCentreId,
            courtRoomId: values.courtRoomId,
            endDate: values.endDate,
            hearingId: values.id,
            hearingLanguage: values.hearingLanguage,
            judiciary,
            jurisdictionType: values.jurisdictionType,
            nonDefaultDays: values.nonDefaultDays,
            nonSittingDays: values.nonSittingDays,
            prosecutionCases,
            startDate: values.startDate,
            publicListNote,
            hasVideoLink,
            type: values.type,
            bookingType: values.bookingType,
            priority: values.priority,
            specialRequirements: values.specialRequirements,
            sendNotificationToParties: values.sendNotificationToParties
          }),
          notificationAndPermissionHandler$
        ]).pipe(
          switchMap(() => [
            CourtCalendarActions.updateSplitHearingDataSuccess(),
            CourtCalendarActions.setAlertMessage({
              successAlert: 'The split hearing has been allocated.'
            }),
            CourtCalendarActions.setSelectedHearingData({ selectedHearing: null })
          ]),
          tap(() => {
            router.navigate(['/court-calendar']);
          }),
          catchError(err => of(new ApiError(err)))
        );
      })
    ),
  { functional: true }
);

export const allocateSelectedHearingSlotsEffect = createEffect(
  (
    action$ = inject(Actions),
    store = inject(Store),
    listingService = inject(ListingService),
    router = inject(Router)
  ) =>
    action$.pipe(
      ofType(CourtCalendarActions.allocateSelectedHearingSlots),
      withLatestFrom(store, store.select(getSelectedHearing), store.select(getSearchParams)),
      switchMap(
        ([
          { hearingSlotAllocations, sendNotificationToParties, hearingType: selectedHearingType },
          state,
          selectedHearing,
          schedulingParams
        ]) => {
          const [firstSlot] = hearingSlotAllocations;
          const type = selectedHearingType ?? selectedHearing.type;
          const referenceDataHearingType = getReferenceDataHearingTypeById(type.id)(state);
          const nonDefaultDays = generateNonDefaultDays(
            hearingSlotAllocations,
            referenceDataHearingType
          );
          const { listedCases } = selectedHearing;

          const organisationUnits = getOrganisationUnits(state);
          const selectedCourt = organisationUnits.find(
            unit => unit.oucode === firstSlot.hearingSlot.ouCode
          );
          const jurisdictionType: JurisdictionType = isMagistratesCourt(selectedCourt)
            ? 'MAGISTRATES'
            : 'CROWN';

          const startDate = firstSlot.hearingSlot.sessionDate;
          const endDate = last(hearingSlotAllocations).hearingSlot.sessionDate;

          const payload = {
            courtCentreId: firstSlot.hearingSlot?.courtHouseId,
            courtRoomId: firstSlot.hearingSlot.courtRoomId,
            startDate,
            endDate:
              jurisdictionType === 'MAGISTRATES'
                ? endDate
                : startDate === endDate
                  ? endDate
                  : (schedulingParams.sessionEndDate ?? endDate),
            hearingLanguage: selectedHearing.hearingLanguage,
            judiciary: selectedHearing.judiciary,
            jurisdictionType,
            nonDefaultDays,
            nonSittingDays: selectedHearing.nonSittingDays,
            publicListNote: selectedHearing.publicListNote,
            hasVideoLink: selectedHearing.hasVideoLink,
            type,
            bookingType: selectedHearing.bookingType,
            priority: selectedHearing.priority,
            specialRequirements: selectedHearing.specialRequirements,
            sendNotificationToParties
          };
          const notificationAndPermissionHandler$ = getPermissionAndNotificationHandler(
            [selectedHearing as HearingWithSelectedCourtCentre],
            selectedHearing.judiciary,
            listingService,
            [
              {
                ...selectedHearing,
                ...payload
              } as HearingWithSelectedCourtCentre
            ]
          );
          return forkJoin([
            listingService.allocateHearing({
              ...payload,
              hearingId: selectedHearing.id,
              prosecutionCases: getAllocateProsecutionCases(listedCases)
            }),
            notificationAndPermissionHandler$
          ]).pipe(
            switchMap(() => [
              CourtCalendarActions.updateSplitHearingDataSuccess(),
              CourtCalendarActions.setAlertMessage({
                successAlert: 'The split hearing has been allocated.'
              }),
              CourtCalendarActions.setSelectedHearingData({ selectedHearing: null })
            ]),
            tap(() => {
              router.navigate(['/court-calendar']);
            }),
            catchError(err => of(new ApiError(err)))
          );
        }
      )
    ),
  { functional: true }
);
