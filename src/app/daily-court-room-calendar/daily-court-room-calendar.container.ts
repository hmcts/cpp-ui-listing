import { map, takeUntil } from 'rxjs/operators';
import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  input,
  output
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { cloneDeep, groupBy } from 'lodash-es';
import {
  AppState,
  CourtroomsFilter,
  filterUrns,
  getAllocatedHearings,
  getReferenceDataHearingTypes,
  getTodaysHearingIds,
  getTodaysHearingUrns,
  getUserId,
  Hearing,
  HearingsGroupedByJudiciary,
  SearchAllocatedHearingsSuccessAction
} from '../core';
import { HearingsPerJudiciaryComponent } from '../shared/components/hearings-per-judiciary/hearings-per-judiciary.component';
import { JudicialRole } from '../core/model';
import { HearingType } from '@cpp/reference-data';
import {
  ValidationError,
  PdkBorderColorDirective,
  PdkMarginDirective,
  PdkPaddingDirective
} from '@cpp/pdk';
import { AppConfigService } from '../config';
import { AsyncPipe } from '@angular/common';
import { TotalListingHoursComponent } from './total-listing-hours/total-listing-hours.component';
import { ListingNoteContainerComponent } from '@cpp/scheduling';
import { CaseAccessAlertComponent } from './case-access-alert/case-access-alert.component';
import { WofdWarningService } from '@cpp/application';

@Component({
  selector: 'daily-court-room-calendar',
  styleUrls: ['./daily-court-room-calendar.scss'],
  templateUrl: './daily-court-room-calendar.html',
  imports: [
    PdkBorderColorDirective,
    TotalListingHoursComponent,
    PdkMarginDirective,
    PdkPaddingDirective,
    ListingNoteContainerComponent,
    CaseAccessAlertComponent,
    HearingsPerJudiciaryComponent,
    AsyncPipe
  ]
})
export class DailyCourtRoomCalendarContainer implements OnChanges, OnDestroy {
  readonly filterOptions = input<CourtroomsFilter>(undefined);
  readonly enableAction = input(false);
  readonly selectedHearingId = input(undefined);
  readonly onHearingSelected = output<Hearing>();
  readonly onSelectChangeJudiciary = output<Hearing[]>();
  readonly clearSidebar = output<void>();
  readonly errors = output<ValidationError[]>();

  @ViewChild(HearingsPerJudiciaryComponent)
  hearingsPerJudiciaryComponent: HearingsPerJudiciaryComponent;

  hearingTypes$: Observable<HearingType[]>;
  selectedHearings: Hearing[];
  hearings: HearingsGroupedByJudiciary[] = [];
  selectedHearing: Hearing;
  groupedHearings: Hearing[];

  todaysHearingIds$: Observable<string[]>;
  todaysHearingUrns$: Observable<string[]>;
  userId$: Observable<string>;

  showModal$ = new BehaviorSubject<'ALL' | 'SINGLE' | null>(null);
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private cdr: ChangeDetectorRef,
    private store: Store<AppState>,
    private appConfig: AppConfigService,
    private wofdWarningService: WofdWarningService
  ) {
    // we initialize the allocated hearing list before doing a search
    this.store.dispatch(new SearchAllocatedHearingsSuccessAction([]));
    this.hearingTypes$ = this.store.select(getReferenceDataHearingTypes);

    this.userId$ = this.store.select(getUserId);
    this.todaysHearingIds$ = this.store.select(getTodaysHearingIds);
    this.todaysHearingUrns$ = combineLatest([
      this.store.select(getTodaysHearingUrns),
      this.showModal$
    ]).pipe(
      map(([allUrns, option]) =>
        filterUrns(option === 'SINGLE' ? [this.selectedHearing] : this.groupedHearings)
      )
    );

    this.store
      .select(getAllocatedHearings)
      .pipe(takeUntil(this.destroy$))
      .subscribe(hearings => {
        this.showModal$.next(null);
        this.selectedHearings = hearings;
        this.hearings = this.groupAndSortHearingsByJudiciary(hearings);
        // as we are not using the async pipe, we must invoke this manually to
        // communicate changes to the component
        this.cdr.markForCheck();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.selectedHearingId()) {
      this.hearingSelected(
        this.selectedHearings.find(hearing => hearing.id === this.selectedHearingId())
      );
    }
  }

  groupAndSortHearingsByJudiciary(allocatedHearings: Hearing[]): HearingsGroupedByJudiciary[] {
    return Object.entries(
      groupBy(allocatedHearings, h => JSON.stringify(this.sortJudiciary(h.judiciary)))
    )
      .map(item => ({
        judiciary: item[0],
        hearings: item[1]
      }))
      .sort((a, b) => (a.judiciary.length || 0) - (b.judiciary.length || 0));
  }

  hearingSelected(hearing: Hearing): void {
    this.selectedHearing = hearing;
    this.onHearingSelected.emit(hearing);
    this.showModal$.next('SINGLE');
  }

  clearSelectedHearing() {
    this.selectedHearing = undefined;
    this.hearingsPerJudiciaryComponent.clearSelectedHearing();
    this.showModal$.next(null);
  }

  convertJudiciaryStringToJson(json: string): JudicialRole {
    return JSON.parse(json);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  onChangeJudiciary(hearings: Hearing[]) {
    this.onSelectChangeJudiciary.emit(hearings);
    this.groupedHearings = hearings;
    this.showModal$.next('ALL');
  }

  sortJudiciary(judiciaries: JudicialRole[]): JudicialRole[] {
    const judiciaryArray = cloneDeep(judiciaries);
    // chairmans have preference, after that we just want to have always the same order
    return judiciaryArray.sort((a, b) => {
      if (a.isBenchChairman && !b.isBenchChairman) {
        return -1;
      } else if (!a.isBenchChairman && b.isBenchChairman) {
        return 1;
      }

      return a.judicialId > b.judicialId ? 1 : -1 || 0;
    });
  }

  onAlertCancel() {
    if (this.clearSidebar) {
      this.clearSidebar.emit();
    }
  }

  getBaseUrl() {
    return this.appConfig.getBaseUrl();
  }

  handleApplicationLinkClick({
    applicationId,
    applicationTypeCode
  }: {
    applicationId: string;
    applicationTypeCode: string;
  }): void {
    const navigateToApplication = () =>
      window.open(
        `${this.getBaseUrl()}/prosecution-casefile/application-at-a-glance/${applicationId}`,
        '_blank'
      );

    const isWofd = this.wofdWarningService.isWofdApplication([{ code: applicationTypeCode }]);

    if (isWofd) {
      this.wofdWarningService.showModal({
        onProceed: navigateToApplication
      });
    } else {
      navigateToApplication();
    }
  }
}
