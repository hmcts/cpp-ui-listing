import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer
} from '@angular/core';
import uuid from 'uuid/v4';
import {
  JudicialMemberNamePipe,
  provideReferenceDataEnvironmentContext
} from '@cpp/reference-data';
import { provideSchedulingEnvironmentContext } from '@cpp/scheduling';
import { provideUserGroupsEnvironmentContext } from '@cpp/users-groups';
import { provideRouter, withRouterConfig } from '@angular/router';
import { CaseNotesResolver } from './app/core/resolvers/case-notes.resolver';
import { AllocationGuard } from './app/allocation/guards/allocation.guard';
import { ModalModule } from 'ngx-bootstrap/modal';
import { provideAnimations } from '@angular/platform-browser/animations';
import { appRoutes } from './app/app-routes';
import {
  BootstrapService,
  ConnectionService,
  HearingSearchService,
  ListingService,
  UnallocatedHearingExistsGuard,
  reducers
} from './app/core';
import { JudiciariesLoadGuard } from './app/core/guards/judiciaries-load';
import { GENERATE_UNIQUE_KEY, provideCppCoreHttpServices, withCppHttpOverrides } from '@cpp/core';
import { AppConfigService } from './app/config';
import { provideStore } from '@ngrx/store';
import { provideRouterStore, RouterState } from '@ngrx/router-store';
import { provideEffects } from '@ngrx/effects';
import { CPPMonitorHttp } from './app/core/http/http-service';
import { extendHearingJudiciaryInterceptor } from './app/court-calendar/interceptors/extend-hearing-judiciary.interceptor';
import { provideCPPApplicationEnvironment } from '@cpp/application';
import { environment } from './environments/environment';
import { provideProtractorTestingSupport, Title } from '@angular/platform-browser';

export const bootstrapAppConfig: ApplicationConfig = {
  providers: [
    ConnectionService,
    BootstrapService,
    ListingService,
    HearingSearchService,
    UnallocatedHearingExistsGuard,
    JudiciariesLoadGuard,
    AllocationGuard,
    Title,
    JudicialMemberNamePipe,
    {
      provide: GENERATE_UNIQUE_KEY,
      useValue: uuid
    },
    { provide: 'Window', useValue: window },
    CaseNotesResolver,
    provideProtractorTestingSupport(),
    provideRouter(appRoutes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideAppInitializer(async () => await inject(AppConfigService).load()),
    // required to expose new standalone injection token for store/ effects
    provideStore(reducers, {
      runtimeChecks: {
        strictActionImmutability: true,
        strictStateImmutability: true
      }
    }),
    provideRouterStore({ routerState: RouterState.Minimal }),
    provideEffects([]),
    provideCppCoreHttpServices(
      withCppHttpOverrides(AppConfigService, CPPMonitorHttp),
      extendHearingJudiciaryInterceptor
    ),
    provideUserGroupsEnvironmentContext(),
    provideCPPApplicationEnvironment(environment),
    provideSchedulingEnvironmentContext(),
    provideReferenceDataEnvironmentContext(),
    ...environment.providers,
    provideAnimations(),
    importProvidersFrom(ModalModule.forRoot())
  ]
};
