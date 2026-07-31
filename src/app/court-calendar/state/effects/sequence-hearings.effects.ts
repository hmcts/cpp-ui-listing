import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ApiError } from '../../../core/actions/api';
import { CourtCalendarActions } from '../actions';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { ListingService } from '../../../core';
import { select, Store } from '@ngrx/store';
import { CourtCalendarFeatureState } from '../court-calendar.state';
import {
  getCourtCalendarFeature,
  getCourtCalendarFilters,
  getAllocateWidgetFilter,
  getAllocationType
} from '../selectors';
import { AllocationType, CourtCalendarFeature } from '../../model';

export const sequenceHearingsEffect = createEffect(
  (actions$ = inject(Actions), listingService = inject(ListingService)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.sequenceGroupHearings),
      switchMap(({ sequencedHearings, onSectionAllocate }) =>
        listingService.sequenceHearingSync(sequencedHearings).pipe(
          map(() => CourtCalendarActions.sequenceGroupHearingsSuccess({ onSectionAllocate })),
          catchError((err) => of(new ApiError(err)))
        )
      )
    ),
  { functional: true }
);

export const sequenceHearingsSuccessEffect = createEffect(
  (actions$ = inject(Actions), store = inject(Store<CourtCalendarFeatureState>)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.sequenceGroupHearingsSuccess),
      withLatestFrom(
        store.pipe(select(getCourtCalendarFilters)),
        store.pipe(select(getCourtCalendarFeature)),
        store.pipe(select(getAllocateWidgetFilter)),
        store.pipe(select(getAllocationType))
      ),
      switchMap(([{ onSectionAllocate }, filterOptions, feature, widgetFilter, allocationType]) => {
        if (feature !== CourtCalendarFeature.calendar) {
          const widgetFilterOptions = { ...filterOptions, ...widgetFilter, endDate: undefined };
          if (allocationType === AllocationType.allocate) {
            return [
              CourtCalendarActions.getUnallocatedHearings({ filterOptions }),
              CourtCalendarActions.getAllocatedHearingsForWidget({
                filterOptions: widgetFilterOptions,
                onSectionAllocate,
                onSequenceOnly: !onSectionAllocate
              })
            ];
          } else {
            return [
              CourtCalendarActions.getAllocatedHearingsForWidget({
                filterOptions: widgetFilterOptions,
                onSectionAllocate,
                onSequenceOnly: !onSectionAllocate
              })
            ];
          }
        }
        return [CourtCalendarActions.searchCourtCalendar({ filterOptions, onSequenceOnly: true })];
      })
    ),
  { functional: true }
);
