import { ChangeDetectionStrategy, Component, OnInit, computed, input, output } from '@angular/core';
import { CaseNote } from '../../../../allocate-hearing/allocate-hearing.interfaces';
import { CourtApplication, Defendant, Hearing, ListedCase } from '../../../../core';
import { CaseNotesComponent } from '../../shared/case-notes/case-notes.component';
import { CustodyStatusComponent } from '../../shared/custody-status/custody-status.component';
import { PdkComponents } from '../../../../shared/pdk-shared-components';
import { FullNamePipe } from '../../../../shared/pipes/full-name.pipe';
import { ApplicantRespondentFullNamePipe } from '../../../../shared/pipes/applicant-respondent-full-name.pipe';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { LIST_TYPE_LABELS, TIER_LABELS } from '../../../utils/tier-and-list-type-labels';

@Component({
  selector: 'allocated-hearing-row-details',
  imports: [
    CaseNotesComponent,
    CustodyStatusComponent,
    PdkComponents,
    FullNamePipe,
    ApplicantRespondentFullNamePipe,
    TitleCasePipe,
    DatePipe
  ],
  templateUrl: './allocated-hearing-row-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./allocated-hearing-row-details.component.scss']
})
export class AllocatedHearingRowDetailsComponent implements OnInit {
  readonly hearing = input<Hearing>(undefined);
  readonly caseId = input<string>(undefined);
  readonly courtName = input<string>(undefined);
  readonly applicationId = input<string>(undefined);
  readonly caseNotes = input<CaseNote[]>(undefined);
  readonly getCaseNotes = output<string>();
  readonly tierLabel = computed(() => TIER_LABELS[this.hearing()?.tier]);
  readonly listTypeLabel = computed(() => LIST_TYPE_LABELS[this.hearing()?.listType]);

  listedCase: ListedCase;
  application: CourtApplication;
  custodyDefendants: Defendant[];

  ngOnInit() {
    const caseId = this.caseId();
    if (caseId) {
      this.getCaseNotes.emit(caseId);
      const hearing = this.hearing();
      if (hearing.listedCases?.length > 0) {
        this.listedCase = (hearing.listedCases ?? []).find(({ id }) => id === this.caseId());
        this.custodyDefendants = this.listedCase?.defendants.filter(
          def => def.bailStatus?.code === 'C'
        );
      }
    }

    const hearing = this.hearing();
    if (this.applicationId() && hearing.courtApplications?.length > 0) {
      this.application = (hearing.courtApplications ?? []).find(
        ({ id }) => id === this.applicationId()
      );
    }
  }
}
