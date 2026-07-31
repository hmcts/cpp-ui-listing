import { Component, ChangeDetectionStrategy, inject, input, model, output } from '@angular/core';
import { first, sortBy } from 'lodash-es';
import { Defendant, Offence, Type, CourtApplication, ListedCase } from '../../../core/model';
import {
  CapitalizeFirstLetterPipe,
  SortHearingsByStartDateThenFirstDefendantNamePipe,
  FindFirstDefendantAlphabeticallyPipe,
  FullNamePipe
} from '../../pipes';
import { CPPDate, getCPPDate } from '../../../core/util';
import { Hearing } from '../../../core/model';
import { TrialType } from '@cpp/reference-data';
import { WofdWarningService } from '@cpp/application';

import { PdkComponents } from '../../pdk-shared-components';
import { CPPDatePipe } from '../../pipes/cpp-date.pipe';
import { CaseMarkersComponent } from '../case-markers/case-markers.component';
import { ReportingRestrictionsComponent } from '../reporting-restrictions/reporting-restrictions.component';
import { YouthFlagComponent } from '../youth-flag/youth-flag.component';
import { HearingOffencesComponent } from '../hearing-offences/hearing-offences.component';

@Component({
  selector: 'hearing-list',
  templateUrl: './hearing-list.html',
  styleUrls: ['hearing-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkComponents,
    CPPDatePipe,
    CaseMarkersComponent,
    ReportingRestrictionsComponent,
    YouthFlagComponent,
    HearingOffencesComponent
  ],
  providers: [
    CapitalizeFirstLetterPipe,
    FindFirstDefendantAlphabeticallyPipe,
    FullNamePipe,
    SortHearingsByStartDateThenFirstDefendantNamePipe
  ]
})
export class HearingListComponent {
  readonly hearings = input([], {
    transform: (value: Hearing[]) =>
      this.sortHearingsByStartDateThenFirstDefendantName.transform(value, null)
  });
  readonly hideActionColumn = input<boolean>(undefined);
  readonly trialTypes = input<TrialType[]>([]);
  readonly pageSize = input(0);
  readonly pageNumber = model(1);
  readonly totalResults = input(0);
  readonly baseUrl = input<string>(undefined);
  readonly onAllocate = output<Hearing>();
  readonly onSplitHearing = output<Hearing>();
  private readonly dateUtil: CPPDate;

  private readonly wofdWarningService = inject(WofdWarningService);

  constructor(
    private capitalizeFirstLetter: CapitalizeFirstLetterPipe,
    private findFirstDefendantAlphabetically: FindFirstDefendantAlphabeticallyPipe,
    private fullName: FullNamePipe,
    private sortHearingsByStartDateThenFirstDefendantName: SortHearingsByStartDateThenFirstDefendantNamePipe
  ) {
    this.dateUtil = getCPPDate();
  }

  allocate(hearing: Hearing) {
    this.onAllocate.emit(hearing);
  }

  canActivateSplit(hearing: Hearing): boolean {
    return hearing.listedCases.some(
      kase =>
        kase.defendants.length > 1 ||
        kase.defendants.some(defendant => defendant.offences.length > 1)
    );
  }

  splitHearing(hearing: Hearing) {
    this.onSplitHearing.emit(hearing);
  }

  formatHearingType(hearingType: Type): string {
    return this.capitalizeFirstLetter.transform(hearingType.description);
  }

  firstDefendantName(defendants: Defendant[]): string {
    const firstDefendant = this.findFirstDefendantAlphabetically.transform(defendants);
    return this.fullName.transform(firstDefendant, null);
  }

  firstDefendantBailStatus(defendants: Defendant[]): string {
    const firstDefendant = this.findFirstDefendantAlphabetically.transform(defendants);

    if (!firstDefendant.bailStatus) {
      return '';
    }

    return firstDefendant.bailStatus.description;
  }

  firstDefendantCustodyTimeLimit(defendants: Defendant[]): string {
    const firstDefendant = this.findFirstDefendantAlphabetically.transform(defendants);
    return firstDefendant !== undefined && firstDefendant.custodyTimeLimit
      ? firstDefendant.custodyTimeLimit
      : '';
  }

  defendantEarliestCustodyTimeLimit(defendants: Defendant[]): string {
    const custodyTimeLimits = [];
    defendants.forEach(defendant => {
      if (defendant.custodyTimeLimit) {
        custodyTimeLimits.push(new Date(defendant.custodyTimeLimit));
      }
    });

    const minDate =
      custodyTimeLimits.length !== 0 ? new Date(Math.min.apply(null, custodyTimeLimits)) : '';
    return defendants !== undefined && minDate !== '' ? this.dateUtil.toUtcISO(minDate) : '';
  }

  firstDefendantOffence(defendants: Defendant[]): string {
    const firstDefendant = this.findFirstDefendantAlphabetically.transform(defendants);
    return this.getFirstOffenceAlphabetically(firstDefendant.offences).statementOfOffence.title;
  }

  plusOtherDefendants(defendants: Defendant[]): string {
    const totalDefendants = defendants === undefined ? 0 : defendants.length;
    let result = '';
    if (totalDefendants > 1) {
      result = `+ ${totalDefendants - 1} other`;
      if (totalDefendants > 2) {
        result += 's';
      }
    }
    return result;
  }

  getFirstOffenceAlphabetically(offences: Offence[]): Offence {
    return first(sortBy(offences, ['statementOfOffence.title']));
  }

  getProsecutor(kase: ListedCase): string {
    return kase.prosecutor ? kase.prosecutor.prosecutorCode : kase.caseIdentifier.authorityCode;
  }

  allOffencesFor(defendants: Defendant[]): Offence[] {
    return (defendants || [])
      .map(defendant => defendant.offences)
      .reduce((acc, cur) => acc.concat(cur), []);
  }

  isStandaloneApplication(hearing: Hearing): boolean {
    return (
      (hearing.listedCases === undefined || hearing.listedCases.length === 0) &&
      hearing.courtApplications.length > 0
    );
  }

  getStandaloneApplicantName(application: CourtApplication): string {
    if (application.applicant.firstName) {
      return `${application.applicant.firstName} ${application.applicant.lastName.toUpperCase()}`;
    } else {
      return `${application.applicant.lastName.toUpperCase()}`;
    }
  }

  getStandaloneRespondentNames(application: CourtApplication): string[] {
    return application.respondents.map(respondent =>
      respondent.firstName
        ? `${respondent.firstName} ${respondent.lastName.toUpperCase()}`
        : `${respondent.lastName.toUpperCase()}`
    );
  }

  // If there are multiple listedCases for a hearing, we need to have dashed borders for
  // the table rows which are in the middle. As border-bottom comes from the pdk, we need to override it.
  // This component shouldn't use a table in order to avoid these issues.
  isCellWithDottedBorderBottom(hearing: Hearing, index: number): boolean {
    const numberOfListedCases = hearing.listedCases.length;
    return numberOfListedCases > 1 && index !== numberOfListedCases - 1;
  }

  isHearingWithMultipleCases(hearing: Hearing): boolean {
    return hearing.listedCases.length > 1;
  }

  pageChanged(event: number) {
    this.pageNumber.set(event);
  }

  onApplicationClick(event: Event, application: CourtApplication): void {
    const isWofd = this.wofdWarningService.isWofdApplication([
      { code: application.applicationTypeCode }
    ]);

    if (isWofd) {
      event.preventDefault();
      this.wofdWarningService.showModal({
        onProceed: () => {
          window.open(
            `${this.baseUrl()}/prosecution-casefile/application-at-a-glance/${application.id}`,
            '_blank'
          );
        }
      });
    }
  }
}
