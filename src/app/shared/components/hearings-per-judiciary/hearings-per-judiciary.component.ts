import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  input,
  model,
  output
} from '@angular/core';
import { first, flatten, keys, map, sortBy } from 'lodash-es';
import moment from 'moment';
import {
  ApplicantRespondent,
  Defendant,
  ExtendedJudicialRole,
  Hearing,
  HearingsGroupedByStartTime
} from '../../../core';
import { CourtApplication, CourtroomsFilter } from '../../../core/model';
import { CourtApplicationPartyType } from '../../../core/model/court-application';
import { CourtRestriction, CourtRestrictionEventType } from '../../../core/model/court-restriction';
import {
  FindFirstDefendantAlphabeticallyPipe,
  GroupHearingsByStartTimeAndThenOrderBySequenceNumberPipe
} from '../../pipes';
import { HearingType } from '@cpp/reference-data';
import {
  PdkTableComponent,
  PdkTableCaptionDirective,
  PdkTextColorDirective,
  PdkTableHeadDirective,
  PdkTableRowDirective,
  PdkTableHeaderDirective,
  PdkVisuallyHiddenDirective,
  PdkTableBodyDirective,
  PdkMarginDirective,
  PdkTableCellDirective,
  PdkBorderColorDirective,
  PdkLinkDirective,
  PdkTypographyDirective
} from '@cpp/pdk';
import { NgTemplateOutlet } from '@angular/common';
import { CaseMarkersComponent } from '../case-markers/case-markers.component';
import { ReportingRestrictionsComponent } from '../reporting-restrictions/reporting-restrictions.component';
import { YouthFlagComponent } from '../youth-flag/youth-flag.component';
import { HearingEstimateComponent } from '../hearing-estimate/hearing-estimate.component';
import { CourtRestrictionsComponent } from '../court-restrictions/court-restrictions.component';
import { CapitalizeFirstLetterPipe } from '../../pipes/capitalize-first-letter.pipe';
import { FindFirstApplicantRespondantAlphabeticallyPipe } from '../../pipes/find-first-respondant-alphabetically.pipe';
import { FullNamePipe } from '../../pipes/full-name.pipe';
import { ApplicantRespondentFullNamePipe } from '../../pipes/applicant-respondent-full-name.pipe';
import { JudiciaryMemberNamesPipe } from '../../pipes/judiciary-member-names.pipe';
import { StartTimeByMatchedHearingDayPipe } from '../../pipes/start-time-by-matched-hearing-day.pipe';
@Component({
  selector: 'hearings-per-judiciary',
  styleUrls: ['./hearings-per-judiciary.scss'],
  templateUrl: './hearings-per-judiciary.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkTableComponent,
    PdkTableCaptionDirective,
    NgTemplateOutlet,
    PdkTextColorDirective,
    PdkTableHeadDirective,
    PdkTableRowDirective,
    PdkTableHeaderDirective,
    PdkVisuallyHiddenDirective,
    PdkTableBodyDirective,
    PdkMarginDirective,
    PdkTableCellDirective,
    PdkBorderColorDirective,
    CaseMarkersComponent,
    PdkLinkDirective,
    PdkTypographyDirective,
    ReportingRestrictionsComponent,
    YouthFlagComponent,
    HearingEstimateComponent,
    CourtRestrictionsComponent,
    CapitalizeFirstLetterPipe,
    FindFirstDefendantAlphabeticallyPipe,
    FindFirstApplicantRespondantAlphabeticallyPipe,
    FullNamePipe,
    ApplicantRespondentFullNamePipe,
    JudiciaryMemberNamesPipe,
    StartTimeByMatchedHearingDayPipe
  ],
  providers: [
    FindFirstDefendantAlphabeticallyPipe,
    GroupHearingsByStartTimeAndThenOrderBySequenceNumberPipe
  ]
})
export class HearingsPerJudiciaryComponent implements OnChanges {
  readonly hearings = input<Hearing[]>(undefined);
  readonly judiciary = input<ExtendedJudicialRole[]>(undefined);
  readonly enableAction = input(false);
  readonly latestSelection = input<Hearing>(undefined);
  readonly selectedDate = input<string>(undefined);
  readonly filterOptions = input<CourtroomsFilter>(undefined);
  readonly defaultStartTime = input('10:30');
  readonly preSelectedHearing = input<Hearing>(undefined);
  readonly timeFormat = input('HH:mm');
  readonly enableReorder = input(false);
  readonly restrictedCourtHearingSelected = model<Hearing>(undefined);
  readonly restrictLists = input<boolean>(undefined);
  readonly weekCommencingSelected = input<boolean>(undefined);
  readonly hearingTypes = input<HearingType[]>(undefined);
  readonly baseUrl = input<string>(undefined);
  readonly onHearingSelected = output<Hearing>();
  readonly onSelectChangeJudiciary = output<Hearing[]>();
  readonly onRestrictionChanged = output<CourtRestriction>();
  readonly onApplicationLinkClick = output<{
    applicationId: string;
    applicationTypeCode: string;
  }>();

  hearingsGroupedByStartTime: HearingsGroupedByStartTime = {};
  sortedHearings: Hearing[];
  selectedHearing: Hearing;
  focussedHearing: Hearing = undefined;

  constructor(
    private findFirstDefendantAlphabetically: FindFirstDefendantAlphabeticallyPipe,
    private groupHearingsByStartTimeThenOrderBySequenceNumber: GroupHearingsByStartTimeAndThenOrderBySequenceNumberPipe
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.preSelectedHearing && changes.preSelectedHearing.currentValue) {
      this.selectedHearing = changes.preSelectedHearing.currentValue;
    }
    if (changes.hearings || changes.selectedDate) {
      this.hearingsGroupedByStartTime = this.groupHearingsByStartTimeThenOrderBySequence();
    }
    if (changes.latestSelection && this.selectedHearing !== this.latestSelection()) {
      this.selectedHearing = undefined;
    }
  }

  firstDefendantOffence(hearing: Hearing, indexListedCase: number): string {
    const firstDefendant = this.findFirstDefendantAlphabetically.transform(
      this.getAllDefendantsByIndexListedCase(hearing, indexListedCase)
    );
    return first(sortBy(firstDefendant.offences, 'statementOfOffence.title')).statementOfOffence
      .title;
  }

  firstApplicationType(hearing: Hearing): string {
    return hearing.courtApplications[0].applicationType;
  }

  getKeysSortedByStartTime(hearingsGroupedByStartTime: HearingsGroupedByStartTime): string[] {
    const startTimes = keys(hearingsGroupedByStartTime);
    // because we want to sort by time, we add the time to any given date and we sort them by date
    return startTimes.sort((a, b) => moment('1970-01-01 ' + a).diff('1970-01-01 ' + b));
  }

  plusOtherDefendantsByIndexListedCase(hearing: Hearing, indexListedCase: number): string {
    let result = '';
    const defendants = this.getAllDefendantsByIndexListedCase(hearing, indexListedCase);
    if (defendants.length > 1) {
      result = `+ ${defendants.length - 1} other`;
      if (defendants.length > 2) {
        result += 's';
      }
    }
    return result;
  }

  plusOtherDefendants(hearing: Hearing): string {
    let result = '';
    const defendants = this.getAllDefendants(hearing);
    if (defendants.length > 1) {
      result = `+ ${defendants.length - 1} other`;
      if (defendants.length > 2) {
        result += 's';
      }
    }
    return result;
  }

  plusOtherRespondants(hearing: Hearing): string {
    let result = '';
    const respondants = this.getAllApplicants(hearing);
    if (respondants.length > 1) {
      result = `+ ${respondants.length - 1} other`;
      if (respondants.length > 2) {
        result += 's';
      }
    }
    return result;
  }

  hearingSelected(hearing: Hearing) {
    if (this.enableAction()) {
      this.selectedHearing = hearing;
      this.onHearingSelected.emit(hearing);
    }
  }

  onMouseOver(hearing: Hearing) {
    this.focussedHearing = hearing;
  }

  onMouseOut() {
    this.focussedHearing = undefined;
  }

  clearSelectedHearing() {
    this.selectedHearing = undefined;
  }

  getHearingTime(hearing: Hearing): string {
    if (!hearing.hearingDays) {
      return '';
    }
    return hearing.hearingDays.find(calendarDay =>
      moment(calendarDay.startTime).isSame(this.selectedDate(), 'day')
    ).startTime;
  }

  private groupHearingsByStartTimeThenOrderBySequence(): HearingsGroupedByStartTime {
    return this.groupHearingsByStartTimeThenOrderBySequenceNumber.transform(
      this.hearings(),
      this.selectedDate(),
      this.weekCommencingSelected()
    );
  }

  getAllDefendantsByIndexListedCase(hearing: Hearing, indexListedCase: number): Defendant[] {
    return hearing.listedCases[indexListedCase].defendants;
  }

  getAllDefendants(hearing: Hearing): Defendant[] {
    return flatten(map(hearing.listedCases, 'defendants'));
  }

  getAllApplicants(hearing: Hearing): ApplicantRespondent[] {
    return flatten(map(hearing.courtApplications, 'applicant'));
  }

  getAllRespondents(hearing: Hearing): ApplicantRespondent[] {
    return [].concat(...hearing.courtApplications.map(application => application.respondents));
  }

  getAllPersonRespondents(hearing: Hearing) {
    return this.getAllRespondents(hearing).filter(
      respondent => respondent.courtApplicationPartyType === CourtApplicationPartyType.Person
    );
  }

  isStandaloneApplication(hearing: Hearing): boolean {
    return (
      (hearing.listedCases === undefined || hearing.listedCases.length === 0) &&
      hearing.courtApplications.length > 0
    );
  }

  getStandAloneApplicationId(hearing: Hearing): string {
    // Standalone application always have one application.
    return hearing.courtApplications[0].id;
  }

  getStandAloneApplicationRef(hearing: Hearing): string {
    // This is a standalone application. Take the fist in the list
    return hearing.courtApplications[0].applicationReference;
  }

  getHearingEstimate(hearing: Hearing) {
    if (this.weekCommencingSelected()) {
      return this.hearingTypes().find(type => type.id === hearing.type.id).defaultDurationMin;
    }
    const hearingDay = hearing.hearingDays.find(day => {
      const filterOptions = this.filterOptions();
      return moment(day.startTime).isSame(
        !!filterOptions ? filterOptions.searchDate : this.selectedDate(),
        'day'
      );
    });

    return hearingDay ? hearingDay.durationMinutes : undefined;
  }

  toggleRestrict(hearing, clear) {
    if (!clear) {
      this.restrictedCourtHearingSelected.set(hearing);
    } else {
      this.restrictedCourtHearingSelected.set(null);
    }
  }

  onRestrictPartyChanged({
    hearingId,
    defendantIds,
    courtApplicationSubjectIds,
    restrictCourtList,
    restrictionEventType
  }: CourtRestriction) {
    switch (restrictionEventType) {
      case CourtRestrictionEventType.SUBJECT:
        this.onRestrictionChanged.emit({
          hearingId,
          courtApplicationSubjectIds,
          restrictCourtList
        });
        break;
      case CourtRestrictionEventType.Defendant:
        this.onRestrictionChanged.emit({
          hearingId,
          defendantIds,
          restrictCourtList
        });
        break;
      default:
        break;
    }
  }

  onRestrictCaseChanged(caseId: string, hearingId: string, restrictValue: boolean) {
    const caseIds = [caseId];
    const courtRestriction: CourtRestriction = {
      caseIds,
      hearingId,
      restrictCourtList: restrictValue
    };
    this.onRestrictionChanged.emit(courtRestriction);
  }

  onRestrictApplicationChanged(applicationId: string, hearingId: string, restrictValue: boolean) {
    const courtApplicationIds = [applicationId];
    const courtRestriction: CourtRestriction = {
      courtApplicationIds,
      hearingId,
      restrictCourtList: restrictValue
    };
    this.onRestrictionChanged.emit(courtRestriction);
  }

  getParentApplication(applications: CourtApplication[]) {
    return applications.filter(
      app => app.parentApplicationId === null || app.parentApplicationId === undefined
    );
  }

  // If there are multiple listedCases for a hearing, we need to have dashed borders for
  // the table rows which are in the middle. As border-bottom comes from the pdk, we need to override it.
  // This component shouldn't use a table in order to avoid these issues.
  isCellWithDottedBorderBottom(hearing: Hearing, index: number): boolean {
    const numberOfListedCases = hearing.listedCases.length;
    return numberOfListedCases > 1 && index !== numberOfListedCases - 1;
  }

  showEstimateTime(hearing: Hearing, index: number): boolean {
    const numberOfListedCases = hearing.listedCases.length;
    return index === 0 && numberOfListedCases >= 1;
  }

  trackModelBy(_: number, model: { id: string }): string {
    return model.id;
  }

  onApplicationClick(event: Event, hearing: Hearing): void {
    event.preventDefault();
    event.stopPropagation();
    const application = hearing.courtApplications[0];
    this.onApplicationLinkClick.emit({
      applicationId: application.id,
      applicationTypeCode: application.applicationTypeCode
    });
  }
}
