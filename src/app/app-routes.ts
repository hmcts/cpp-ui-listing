import { Routes } from '@angular/router';
import {
  ClustersGuard,
  HearingTypesGuard,
  OrganisationUnitsGuard,
  ProsecutorsGuard,
  RotaBusinessTypesGuard,
  SpecialRequirementsGuard,
  JudiciaryGroupTypesGuard,
  LocalJusticeAreasGuard,
  TrialTypesGuard,
  PublicHolidaysGuard
} from '@cpp/reference-data';
import { AllocateHearingContainer } from './allocate-hearing/allocate-hearing.container';
import { AllocationGuard } from './allocation/guards/allocation.guard';
import { HearingEffects, RouterEffects, UnallocatedHearingExistsGuard } from './core';
import {
  featuresExist,
  permissionsExist,
  RolePermission,
  UserDetailsGuard,
  UserGroupsGuard,
  UserPermissionsExistGuard,
  UserPermissionsGuard,
  UserService,
  UserServiceExistsGuard,
  UserServicesGuard
} from '@cpp/users-groups';

import { CaseNotesResolver } from './core/resolvers/case-notes.resolver';
import { JudiciariesLoadGuard } from './core/guards/judiciaries-load';
import {
  ERROR_PAGES_ROUTES,
  ERROR_ROUTE_PATHS,
  SYSTEM_ANNOUNCEMENT_ROUTES
} from '@cpp/application';
import { userPermissions } from './config';
import { provideEffects } from '@ngrx/effects';
import { SchedulingEffects } from './allocation/effects/scheduling.effects';

export function allocatedHearingsGuardHelper(userServices: UserService[]): boolean {
  return featuresExist(userServices, ['listing-allocatedHearings']);
}

export function unallocatedHearingsGuardHelper(userServices: UserService[]): boolean {
  return featuresExist(userServices, ['listing-unallocatedHearings']);
}

export function createAListGuardHelper(userServices: UserService[]): boolean {
  return featuresExist(userServices, [
    'listing-publishAndDownloadHearingLists',
    'listing-downloadHearingLists'
  ]);
}

export function unscheduledListingsGuardHelper(userServices: UserService[]): boolean {
  return featuresExist(userServices, ['listing-unscheduledListings']);
}

export const createPrisonListGuardHelper = (permissions: RolePermission[]) =>
  permissionsExist(permissions, [userPermissions.downloadPrisonList]);

export const manageCourtcalendarGuardHelper = (permissions: RolePermission[]) =>
  permissionsExist(permissions, [userPermissions.manageCourtcalendar]);
export function findAvailableSessionsGuardHelper(userServices: UserService[]): boolean {
  return featuresExist(userServices, ['find-available-sessions']);
}

// It is important to load the User related guards first as Service availability anchors on these guards.
export const appRoutes: Routes = [
  {
    path: '',
    providers: [provideEffects(HearingEffects, RouterEffects, SchedulingEffects)],
    canActivate: [
      UserPermissionsGuard,
      UserGroupsGuard,
      UserServicesGuard,
      UserDetailsGuard,
      ClustersGuard,
      HearingTypesGuard,
      OrganisationUnitsGuard,
      ProsecutorsGuard,
      JudiciariesLoadGuard,
      JudiciaryGroupTypesGuard,
      LocalJusticeAreasGuard,
      SpecialRequirementsGuard
    ],
    data: {
      userServicesErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`,
      serviceUnavailableRedirectTo: `/${ERROR_ROUTE_PATHS.serviceUnavailable}`
    },
    children: [
      {
        path: '',
        canActivate: [
          HearingTypesGuard,
          OrganisationUnitsGuard,
          ProsecutorsGuard,
          JudiciariesLoadGuard,
          JudiciaryGroupTypesGuard
        ],
        children: [
          {
            path: '',
            redirectTo: 'unallocated',
            pathMatch: 'full'
          },
          {
            path: 'unallocated',
            runGuardsAndResolvers: 'always',
            canActivate: [UserServiceExistsGuard, UserDetailsGuard],
            data: {
              title: 'Unallocated hearings | Common Platform',
              userServiceExistsPredicate: unallocatedHearingsGuardHelper,
              userServiceExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`
            },
            children: [
              {
                path: '',
                loadChildren: () =>
                  import('./unallocated-hearings/unallocated-hearings.routes').then(m => m.routes)
              },
              {
                path: ':id',
                data: {
                  title: 'Allocate a hearing | Common Platform'
                },
                canActivate: [
                  AllocationGuard,
                  RotaBusinessTypesGuard,
                  UnallocatedHearingExistsGuard,
                  TrialTypesGuard
                ],
                resolve: {
                  dataLoaded: CaseNotesResolver
                },
                runGuardsAndResolvers: 'always',
                component: AllocateHearingContainer
              }
            ]
          },
          {
            path: 'split/:id',
            loadChildren: () => import('./split-hearing/split-hearing.routes').then(m => m.routes),
            runGuardsAndResolvers: 'always',
            canActivate: [UserServiceExistsGuard, UnallocatedHearingExistsGuard, UserDetailsGuard],
            data: {
              title: 'Allocate hearing | Common Platform',
              userServiceExistsPredicate: unallocatedHearingsGuardHelper,
              userServiceExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`
            }
          },
          {
            path: 'court-calendar',
            loadChildren: () =>
              import('./court-calendar/court-calendar.routes').then(m => m.courtCalendarRoutes),
            runGuardsAndResolvers: 'always',
            canActivate: [UserDetailsGuard, UserPermissionsExistGuard],
            data: {
              title: 'Court Calendar | Common Platform',
              userPermissionsExistsPredicate: manageCourtcalendarGuardHelper,
              userPermissionsExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`
            }
          },
          {
            path: 'create-a-list',
            loadChildren: () => import('./create-a-list/create-a-list.routes').then(m => m.routes),
            runGuardsAndResolvers: 'always',
            canActivate: [UserServiceExistsGuard, UserDetailsGuard, PublicHolidaysGuard],
            data: {
              title: 'Publish and download hearing lists | Common Platform',
              userServiceExistsPredicate: createAListGuardHelper,
              userServiceExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`
            }
          },
          {
            path: 'unscheduled',
            loadChildren: () =>
              import('./unscheduled-listings/unscheduled-listings.routes').then(m => m.routes),
            runGuardsAndResolvers: 'always',
            canActivate: [UserServiceExistsGuard],
            data: {
              title: 'Unscheduled list | Common Platform',
              userServiceExistsPredicate: unscheduledListingsGuardHelper,
              userServiceExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`
            }
          },
          {
            path: 'create-prison-list',
            loadChildren: () =>
              import('./create-prison-list/create-prison-list.routes').then(m => m.routes),
            runGuardsAndResolvers: 'always',
            canActivate: [UserDetailsGuard, PublicHolidaysGuard, UserPermissionsExistGuard],
            data: {
              title: 'Download prison list | Common Platform',
              userPermissionsExistsPredicate: createPrisonListGuardHelper,
              userPermissionsExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`
            }
          },
          {
            path: 'find-available-sessions',
            loadChildren: () =>
              import('./find-available-sessions/find-available-session.routes').then(m => m.routes),
            runGuardsAndResolvers: 'always',
            canActivate: [RotaBusinessTypesGuard],
            data: {
              title: 'Find available sessions | Common Platform',
              userPermissionsExistsPredicate: findAvailableSessionsGuardHelper,
              userPermissionsExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`
            }
          }
        ]
      }
    ]
  },
  ...SYSTEM_ANNOUNCEMENT_ROUTES,
  ...ERROR_PAGES_ROUTES
];
