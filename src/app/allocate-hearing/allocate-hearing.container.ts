import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PdkTabs, PdkTabComponent, ValidationError } from '@cpp/pdk';
import { getOrganisationUnits, OrganisationUnit, TrialType } from '@cpp/reference-data';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { CrownSchedulingContainer } from '../allocation/containers/crown-scheduling.container';
import { MagistratesSchedulingContainer } from '../allocation/containers/magistrates-scheduling.container';
import { AppConfigService } from '../config';
import {
  AggregatedCaseNotes,
  AppState,
  CourtCentre,
  getAvailableHearings,
  getCourtCentres,
  getHearingById,
  getPinnedCaseNotesForHearing,
  getScheduledHearingForAllocation,
  getTrialTypesFilteredByType,
  Hearing,
  isScheduledAllocatedHearingOnlyWithLinkedApplication,
  isScheduledAllocatedHearingStandaloneApplication,
  ScheduledAllocateHearingAction,
  SearchAvailableHearingsFormOptions
} from '../core/';
import { ExtendHearingForHearingAction, SearchAvailableHearingsAction } from '../core/actions';
import { Breadcrumb } from '../core/model/shared/breadcrumb';
import { getHasApiActivity } from '../core/selectors/api';
import { getSelectedHearing } from '../court-calendar/state';
import { HearingListComponent } from '../shared/components/hearing-list/hearing-list.component';
import { BreadcrumbsComponent } from '../shared/components/breadcrumbs/breadcrumbs.component';
import { HearingSummaryComponent } from '../shared/components/hearing-summary/hearing-summary.component';
import { PdkComponents } from '../shared/pdk-shared-components';
import { AvailableHearingsComponent } from './available-hearings/available-hearings.component';
import { CourtSelectionComponent } from './court-selection/court-selection.component';
import { FindAvailableHearingComponent } from './find-available-hearing/find-available-hearing.component';
import { PinnedNotesComponent } from './pinned-notes/pinned-notes.component';
import { AsyncPipe } from '@angular/common';

interface OrganisationUnitWithJurisdication extends OrganisationUnit {
  jurisdictionType?: string;
}

@Component({
  selector: 'allocate-hearing',
  templateUrl: './allocate-hearing.container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CrownSchedulingContainer,
    MagistratesSchedulingContainer,
    HearingListComponent,
    PdkTabs,
    PdkComponents,
    FindAvailableHearingComponent,
    AvailableHearingsComponent,
    PinnedNotesComponent,
    CourtSelectionComponent,
    BreadcrumbsComponent,
    HearingSummaryComponent,
    AsyncPipe
  ]
})
export class AllocateHearingContainer implements OnInit, OnDestroy {
  selectedHearing$: Observable<Hearing>;
  availableHearings$: Observable<Hearing[]>;
  isLoading$: Observable<boolean>;
  isHearingStandaloneApplication$: Observable<boolean>;
  isHearingOnlyWithLinkedApplication$: Observable<boolean>;
  trialTypes$: Observable<TrialType[]>;
  courtCentres: CourtCentre[];
  pinnedCaseNotes$: Observable<AggregatedCaseNotes[]>;
  organisationUnits: OrganisationUnit[];
  errors: ValidationError[] = null;
  selectedOrganisationUnit: OrganisationUnitWithJurisdication;
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedTab: string;
  selectedHearingId: string;
  backUrl: string;
  initialTabIndex = 0;
  isUnscheduledHearing: boolean;
  queryParams: Record<string, string>;
  hasCourtSelectionStep: boolean;
  selectedHearing: Hearing;
  isSplitHearing = false;
  isCivil: boolean;
  minDate: string;
  breadcrumbs: Breadcrumb[] = [
    { title: 'Home', href: this.appConfig.getBaseUrl() },
    { title: 'Allocate hearing' }
  ];

  constructor(
    private store: Store<AppState>,
    public route: ActivatedRoute,
    private appConfig: AppConfigService,
    private router: Router,
    @Inject('Window') private window: Window
  ) {
    this.store
      .select(getCourtCentres)
      .pipe(takeUntil(this.destroy$))
      .subscribe(courtCentres => (this.courtCentres = courtCentres));

    this.store
      .select(getOrganisationUnits)
      .pipe(
        tap(orgUnits => (this.organisationUnits = orgUnits)),
        take(1)
      )
      .subscribe();

    this.availableHearings$ = this.store.select(getAvailableHearings);
    this.pinnedCaseNotes$ = this.store.select(
      getPinnedCaseNotesForHearing,
      this.route.snapshot.params.id
    );
    this.isLoading$ = this.store.select(getHasApiActivity);
  }

  ngOnInit() {
    this.trialTypes$ = this.store.select(getTrialTypesFilteredByType);
    this.isHearingStandaloneApplication$ = this.store.select(
      isScheduledAllocatedHearingStandaloneApplication
    );
    this.isHearingOnlyWithLinkedApplication$ = this.store.select(
      isScheduledAllocatedHearingOnlyWithLinkedApplication
    );
    this.isUnscheduledHearing = !!this.route.snapshot.queryParams.isUnscheduled;

    this.initialiseSelectedHearing();

    this.initialTabIndex = this.route.snapshot.queryParams.mf ? 1 : 0;
    this.queryParams = this.route.snapshot.queryParams;

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(({ courtId }) => {
      if (courtId) {
        this.selectedOrganisationUnit = this.organisationUnits?.find(({ id }) => id === courtId);
        if (this.selectedOrganisationUnit) {
          this.selectedOrganisationUnit = {
            ...this.selectedOrganisationUnit,
            jurisdictionType:
              this.selectedOrganisationUnit.oucodeL1Code === 'C' ? 'CROWN' : 'MAGISTRATES'
          };
          this.hasCourtSelectionStep = true;
        }
      } else {
        this.selectedOrganisationUnit = undefined;
        this.hasCourtSelectionStep = false;
      }
    });
  }

  showValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }

  navigate(url: string): void {
    this.router.navigate([url]).then(() => {
      this.window.scroll(0, 0);
    });
  }

  onSelectedTabChange(value: PdkTabComponent): void {
    this.selectedTab = value.heading;
  }

  get isRelatedHearingsTabSelected(): boolean {
    return this.selectedTab === 'Related hearings';
  }

  findAvailableHearings(formOptions: SearchAvailableHearingsFormOptions): void {
    this.store.dispatch(
      new SearchAvailableHearingsAction({ ...formOptions, returnAllHearings: true })
    );
  }

  extendHearingForHearing({
    selectedHearingId: extendedHearingId,
    sendNotificationToParties
  }): void {
    this.store.dispatch(
      new ExtendHearingForHearingAction({
        selectedHearingId: this.selectedHearingId,
        extendedHearingId,
        isUnscheduledHearing: this.isUnscheduledHearing,
        sendNotificationToParties
      })
    );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private initialiseSelectedHearing(): void {
    if (this.isUnscheduledHearing) {
      this.backUrl = '/unscheduled';
    } else {
      this.backUrl = '/unallocated';
    }

    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        filter(([params, queryParams]) => {
          if (!!params.get('id') && this.selectedHearingId !== params.get('id')) {
            return true;
          }

          const split = !!queryParams.get('split');
          return !!this.selectedHearingId && this.isSplitHearing !== split;
        }),
        switchMap(([params, queryParams]) => {
          this.selectedHearingId = params.get('id');
          this.isSplitHearing = !!queryParams.get('split');

          if (!this.isSplitHearing) {
            return this.store.select(getHearingById(this.selectedHearingId)).pipe(
              tap(hearingSelected => {
                this.selectedHearing = hearingSelected;
                this.store.dispatch(new ScheduledAllocateHearingAction(hearingSelected));
                this.isCivil = this.selectedHearing?.listedCases?.[0]?.isCivil;
              })
            );
          }

          this.backUrl = `/split/${this.selectedHearingId}`;

          if (this.route.snapshot?.queryParams?.referrer === 'CALENDAR') {
            return this.store.select(getSelectedHearing).pipe(
              tap(hearingselected => {
                this.selectedHearing = hearingselected;
              })
            );
          }

          return this.store.select(getScheduledHearingForAllocation).pipe(
            tap(hearingSelected => {
              if (!hearingSelected) {
                this.router.navigate([`/split/${this.selectedHearingId}`]);
              }

              this.selectedHearing = hearingSelected;
              this.isCivil = this.selectedHearing?.listedCases?.[0]?.isCivil;
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  viewHearingDetails(hearing: Hearing): void {
    const courtCentre = this.courtCentres.find(
      currentCourtCentre => currentCourtCentre.id === hearing.courtCentreId
    );
    const courtRoom = courtCentre.courtRooms.find(
      currentCourtRoom => currentCourtRoom.id === hearing.courtRoomId
    );
    this.window.open(
      `${this.appConfig.appUrl}/hearing/list?hearingDate=${hearing.hearingDays[0].hearingDate}&courtCentreName=${courtCentre.name}&courtCentreId=${courtCentre.id}&courtRoomName=${courtRoom.name}&courtRoomId=${courtRoom.id}&hearingId=${hearing.id}`,
      '_blank'
    );
  }

  getBaseUrl() {
    return this.appConfig.getBaseUrl();
  }

  backUrlNavigate() {
    this.hasCourtSelectionStep = false;
    this.selectedOrganisationUnit = undefined;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        courtId: undefined,
        mf: undefined
      },
      queryParamsHandling: 'merge'
    });
  }

  onCourtSelected($event: OrganisationUnit) {
    if ($event) {
      this.selectedOrganisationUnit = this.organisationUnits.find(({ id }) => $event.id === id);
      this.hasCourtSelectionStep = !this.hasCourtSelectionStep;

      this.selectedOrganisationUnit = {
        ...this.selectedOrganisationUnit,
        jurisdictionType:
          this.selectedOrganisationUnit.oucodeL1Code === 'C' ? 'CROWN' : 'MAGISTRATES'
      };
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          courtId: $event.id,
          jurisdictionType:
            this.selectedOrganisationUnit.oucodeL1Code === 'C' ? 'CROWN' : 'MAGISTRATES'
        },
        queryParamsHandling: 'merge'
      });
    }
  }
}
