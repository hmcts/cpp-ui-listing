import { Routes } from '@angular/router';
import { OrganisationUnitsGuard, RotaBusinessTypesGuard } from '@cpp/reference-data';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import {
  courtCalendarFeatureReducer,
  COURT_CALENDAR_FEATURE_KEY,
  courtCalendarEffects,
  CourtCalendarFeature
} from './state';
import { changeJudiciaryResolver } from './resolver/change-judiciary-resolver';
import { selectedHearingGuard } from './guards/selected-hearing.guard';
import {
  searchAllocatedWidgetHearingsGuard,
  searchAllocatedHearingsByFilterGuard
} from './guards/search-allocated-hearings.guards';
import { getUnallocatedHearingsGuard } from './guards/get-unallocated-hearings.guard';
import { reallocateHearingsNavGuard } from './guards/reallocate-hearings-nav-guard';
import { getSessionsForSeelectedHearingGuard } from './guards/get-sessions-for-selected-hearings.guard';

export enum CourtCalendarRoutes {
  //:TODO add routes for all sub pages
  EDIT_JUDICIRAY = 'edit-judiciary',
  EDIT_HEARING = 'edit-hearing',
  REMOVE_HEARINGS = 'remove-hearing',
  CHANGE_HEARING = 'change-hearing-details',
  ALLOCATE_HEARINGS = 'allocate-hearings',
  CHANGE_COURTROOM = 'change-courtroom'
}

export const courtCalendarRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/court-calendar.container').then((c) => c.CourtCalendarContainer),
    canActivate: [
      OrganisationUnitsGuard,
      RotaBusinessTypesGuard,
      searchAllocatedHearingsByFilterGuard
    ],
    providers: [
      provideState(COURT_CALENDAR_FEATURE_KEY, courtCalendarFeatureReducer),
      provideEffects(courtCalendarEffects)
    ],
    data: {
      title: 'Court Calendar | Common Platform',
      feature: CourtCalendarFeature.calendar
    }
  },
  {
    path: `${CourtCalendarRoutes.EDIT_JUDICIRAY}`,
    loadComponent: () =>
      import('./edit-judiciary/edit-judiciary.container').then((c) => c.EditJudiciaryContainer),
    canActivate: [OrganisationUnitsGuard, RotaBusinessTypesGuard],
    resolve: { allocatedHearings: changeJudiciaryResolver },
    data: {
      title: 'Edit Judiciary | Common Platform',
      feature: CourtCalendarFeature.calendar
    }
  },
  {
    path: `${CourtCalendarRoutes.CHANGE_HEARING}/:hearingId`,
    canActivate: [OrganisationUnitsGuard, RotaBusinessTypesGuard, selectedHearingGuard],
    children: [
      {
        path: '',
        canActivate: [getSessionsForSeelectedHearingGuard],
        loadComponent: () =>
          import('./change-hearing-details/containers/change-hearing-details.container').then(
            (c) => c.ChangehearingDetailsContainer
          )
      }
    ],
    data: {
      title: 'Change Hearing Details | Common Platform',
      feature: CourtCalendarFeature.calendar
    }
  },
  {
    path: `${CourtCalendarRoutes.CHANGE_COURTROOM}/:hearingId`,
    canActivate: [OrganisationUnitsGuard, selectedHearingGuard],
    loadComponent: () =>
      import('./change-courtroom/containers/change-courtroom.container').then(
        (c) => c.ChangeCourtroomContainer
      ),
    children: [
      {
        path: '',
        redirectTo: 'all-hearing-days',
        pathMatch: 'full'
      },
      {
        path: 'all-hearing-days',
        loadComponent: () =>
          import('./change-courtroom/containers/hearing-days-selection.container').then(
            (c) => c.HearingDaysSelectionContainer
          )
      },
      {
        path: 'selected-hearing-days',
        loadComponent: () =>
          import('./change-courtroom/containers/selected-hearing-days.container').then(
            (c) => c.selectedhearingDaysContainer
          )
      },
      {
        path: 'all-future-hearingdays-selected',
        loadComponent: () =>
          import(
            './change-courtroom/containers/all-upcoming-hearing-days-selected/all-upcoming-hearingdays-selected.container'
          ).then((c) => c.AllFutureHearingDaysSelectedContainer)
      },
      {
        path: 'all-future-hearingdays-selected-confirm',
        loadComponent: () =>
          import(
            './change-courtroom/containers/all-upcoming-hearing-days-selected-confirm/all-upcoming-hearingdays-selected-confirm.container'
          ).then((c) => c.AllFutureHearingDaysSelectedConfirmContainer)
      },
      {
        path: 'success-banner',
        loadComponent: () =>
          import('./change-courtroom/containers/success-banner.container').then(
            (c) => c.SuccessBannerContainer
          )
      }
    ],
    data: {
      title: 'Change Courtroom | Common Platform',
      feature: CourtCalendarFeature.calendar
    }
  },
  {
    path: `${CourtCalendarRoutes.REMOVE_HEARINGS}/:hearingId`,
    canActivate: [OrganisationUnitsGuard, RotaBusinessTypesGuard, selectedHearingGuard],
    loadComponent: () =>
      import('./remove-hearing/containers/remove-hearing.container').then(
        (c) => c.RemoveHearingContainer
      ),
    data: {
      title: 'Remove Hearing | Common Platform',
      feature: CourtCalendarFeature.calendar
    }
  },
  {
    path: `${CourtCalendarRoutes.ALLOCATE_HEARINGS}`,
    canActivate: [OrganisationUnitsGuard, RotaBusinessTypesGuard],
    children: [
      {
        path: 'crown/:courtCentreId',
        data: {
          feature: CourtCalendarFeature.allocateCrown
        },
        children: [
          {
            path: 'unallocated',
            canActivate: [getUnallocatedHearingsGuard],
            children: [
              {
                path: '',
                canActivate: [searchAllocatedWidgetHearingsGuard],
                loadComponent: () =>
                  import(
                    './court-calendar-hearing-tables/hearing-allocation/containers/allocate-crown-hearings.container'
                  ).then((c) => c.AllocateCrownHearingsContainer)
              }
            ],
            data: {
              title: 'Add Unallocated Hearings | Common Platform'
            }
          },
          {
            path: 'reallocate',
            canActivate: [reallocateHearingsNavGuard],
            children: [
              {
                path: '',
                canActivate: [searchAllocatedWidgetHearingsGuard],
                loadComponent: () =>
                  import(
                    './court-calendar-hearing-tables/hearing-allocation/containers/allocate-crown-hearings.container'
                  ).then((c) => c.AllocateCrownHearingsContainer)
              }
            ],
            data: {
              title: 'Reallocate Hearings | Common Platform'
            }
          }
        ]
      },
      {
        path: 'magistrates/:courtCentreId',
        data: {
          feature: CourtCalendarFeature.allocateMag
        },
        children: [
          {
            path: 'unallocated',
            canActivate: [getUnallocatedHearingsGuard],
            children: [
              {
                path: '',
                canActivate: [searchAllocatedWidgetHearingsGuard],
                loadComponent: () =>
                  import(
                    './court-calendar-hearing-tables/hearing-allocation/containers/allocate-magistrates-hearings.container'
                  ).then((c) => c.AllocateMagistratesHearingsContainer)
              }
            ],
            data: {
              title: 'Add Unallocated Hearings | Common Platform'
            }
          },
          {
            path: 'reallocate',
            canActivate: [reallocateHearingsNavGuard],
            children: [
              {
                path: '',
                canActivate: [searchAllocatedWidgetHearingsGuard],
                loadComponent: () =>
                  import(
                    './court-calendar-hearing-tables/hearing-allocation/containers/allocate-magistrates-hearings.container'
                  ).then((c) => c.AllocateMagistratesHearingsContainer)
              }
            ],
            data: {
              title: 'Reallocate Hearings | Common Platform'
            }
          }
        ]
      }
    ]
  }
];
