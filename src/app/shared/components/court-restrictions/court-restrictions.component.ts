import { Component, input, output } from '@angular/core';
import { CourtRestriction, CourtRestrictionEventType } from '../../../core/model/court-restriction';
import { ApplicantRespondent, CourtApplication } from '../../../core/model';
import { FullNamePipe } from '../../pipes';
import { sortBy } from 'lodash-es';
import { CourtApplicationPartyType } from '../../../core/model/court-application';
import { Hearing, ListedCase } from '../../../core/model';
import { AppState, getRestrictExpandstatus, CourtRestrictionExpandAction } from '../../../core';
import { Store, createSelector } from '@ngrx/store';
import {
  PdkTableCellDirective,
  PdkDetailsComponent,
  PdkDetailsDirective,
  PdkDetailsSummaryComponent,
  PdkVisuallyHiddenDirective,
  PdkTextColorDirective,
  PdkTypographyDirective,
  PdkBorderColorDirective,
  PdkDividerComponent,
  PdkMarginDirective,
  PdkFormGroupComponent,
  PdkFormGroupDirective,
  PdkCheckboxComponent,
  PdkPaddingDirective
} from '@cpp/pdk';
import { NgStyle, NgClass, AsyncPipe } from '@angular/common';
import { ReportingRestrictionsComponent } from '../reporting-restrictions/reporting-restrictions.component';
import { YouthFlagComponent } from '../youth-flag/youth-flag.component';
import { HearingEstimateComponent } from '../hearing-estimate/hearing-estimate.component';
import { FormsModule } from '@angular/forms';
import { CapitalizeFirstLetterPipe } from '../../pipes/capitalize-first-letter.pipe';
import { ApplicantRespondentFullNamePipe } from '../../pipes/applicant-respondent-full-name.pipe';

@Component({
  selector: 'court-restrictions',
  templateUrl: './court-restrictions.component.html',
  styleUrls: ['./court-restrictions.component.scss'],
  imports: [
    PdkTableCellDirective,
    PdkDetailsComponent,
    PdkDetailsDirective,
    PdkDetailsSummaryComponent,
    PdkVisuallyHiddenDirective,
    PdkTextColorDirective,
    PdkTypographyDirective,
    ReportingRestrictionsComponent,
    YouthFlagComponent,
    HearingEstimateComponent,
    PdkBorderColorDirective,
    PdkDividerComponent,
    NgStyle,
    PdkMarginDirective,
    PdkFormGroupComponent,
    PdkFormGroupDirective,
    PdkCheckboxComponent,
    FormsModule,
    PdkPaddingDirective,
    NgClass,
    AsyncPipe,
    CapitalizeFirstLetterPipe,
    ApplicantRespondentFullNamePipe
  ],
  providers: [FullNamePipe]
})
export class CourtRestrictionsComponent {
  readonly hearingType = input<string>(undefined);
  readonly estimatedMinutes = input<string>(undefined);
  readonly hearing = input<Hearing>(undefined);
  readonly isCase = input<boolean>(undefined);
  readonly isApplication = input<boolean>(undefined);
  readonly hearingTime = input<string>(undefined);
  readonly weekCommencingSelected = input<boolean>(undefined);
  readonly restrictPartyChanged = output<CourtRestriction>();
  readonly onRestrictCase = output<{
    id: string;
    restrictValue: boolean;
  }>();
  readonly onRestrictApplication = output<{
    id: string;
    restrictValue: boolean;
  }>();

  readonly restrictionEventType = CourtRestrictionEventType;

  firstDefendant(indexListedCase: number) {
    return this.sortCaseDefendants(this.hearing().listedCases[indexListedCase])[0];
  }

  get hearingIsSingleCase() {
    const hearing = this.hearing();
    return hearing && hearing.listedCases && hearing.listedCases.length === 1;
  }
  constructor(
    private fullName: FullNamePipe,
    private store: Store<AppState>
  ) {}

  getDefendantName(defendant) {
    if (defendant) {
      return this.fullName.transform(defendant, null);
    } else {
      return '';
    }
  }

  getAllApplicants(hearing: Hearing): ApplicantRespondent[] {
    return [].concat(hearing.courtApplications.map(application => application.applicant));
  }

  getAllRespondents(hearing: Hearing): ApplicantRespondent[] {
    return [].concat(...hearing.courtApplications.map(application => application.respondents));
  }

  getAllPersonRespondents(hearing: Hearing): ApplicantRespondent[] {
    return this.getAllRespondents(hearing).filter(
      respondent => respondent.courtApplicationPartyType === CourtApplicationPartyType.Person
    );
  }

  sortCaseDefendants(caseObject: ListedCase) {
    return sortBy(caseObject.defendants, ['organisationName', 'firstName']);
  }

  hasDottedBorder(numberOfListedCases: number, indexListedCase: number): boolean {
    return numberOfListedCases > 1 && indexListedCase !== numberOfListedCases - 1;
  }

  onRestrictParty(
    restrictionType: CourtRestrictionEventType,
    subjectId: string,
    restrictValue: boolean
  ) {
    switch (restrictionType) {
      case CourtRestrictionEventType.Defendant:
        this.restrictPartyChanged.emit({
          restrictionEventType: restrictionType,
          defendantIds: [subjectId],
          hearingId: this.hearing().id,
          restrictCourtList: restrictValue
        });
        break;
      case CourtRestrictionEventType.SUBJECT:
        this.restrictPartyChanged.emit({
          restrictionEventType: restrictionType,
          courtApplicationSubjectIds: [subjectId],
          hearingId: this.hearing().id,
          restrictCourtList: restrictValue
        });
        break;
      default:
        break;
    }
  }

  setCheckBoxDisabledState(caseObject: ListedCase | CourtApplication) {
    return !!caseObject.restrictFromCourtList;
  }

  plusOtherDefendants(hearing: Hearing, indexListedCase: number): string {
    let result = '';
    const defendants = hearing.listedCases[indexListedCase].defendants;
    if (defendants.length > 1) {
      result = `+ ${defendants.length - 1} other`;
      if (defendants.length > 2) {
        result += 's';
      }
    }
    return result;
  }

  toggleRestrict(id: string) {
    if (id) {
      this.store.dispatch(new CourtRestrictionExpandAction(id));
    }
  }

  getExpandStatus(id: string) {
    const expandItemId = id;
    return this.store.select(
      createSelector(
        getRestrictExpandstatus,
        statuses => (statuses && statuses[expandItemId]) || false
      )
    );
  }

  getParentApplication(applications: CourtApplication[]) {
    return applications.filter(
      app => app.parentApplicationId === null || app.parentApplicationId === undefined
    );
  }

  showEstimateTime(hearing: Hearing, index: number): boolean {
    const numberOfListedCases = hearing.listedCases.length;
    return index === 0 && numberOfListedCases >= 1;
  }

  bulkCaseDefendantName(kase: ListedCase) {
    const hearing = this.hearing();
    return kase && !!kase.isGroupMaster && hearing.totalCases
      ? `${hearing.totalCases} DEFENDANTS`
      : '';
  }
}
