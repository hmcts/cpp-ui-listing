import { Component, ChangeDetectionStrategy, OnInit, input, output } from '@angular/core';
import { CaseNote } from '../../../../allocate-hearing/allocate-hearing.interfaces';
import { CourtApplication, Defendant, Hearing, ListedCase, Offence } from '../../../../core';
import { OffenceWordingCellComponent } from '../../renderers/cell-renderers/offence-wording-cell.component';
import { CaseNotesComponent } from '../case-notes/case-notes.component';
import { CustodyStatusComponent } from '../custody-status/custody-status.component';
import { FormsModule } from '@angular/forms';
import { PdkCharacterCountComponent } from '@cpp/pdk';
import { FullNamePipe } from '../../../../shared/pipes/full-name.pipe';
import { ApplicantRespondentFullNamePipe } from '../../../../shared/pipes/applicant-respondent-full-name.pipe';
import { PdkComponents } from '../../../../shared/pdk-shared-components';
import { DatePipe, TitleCasePipe } from '@angular/common';
@Component({
  selector: 'view-hearing-row-details',
  templateUrl: './view-hearing-row-details.html',
  styleUrls: ['./view-hearing-row-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    OffenceWordingCellComponent,
    CaseNotesComponent,
    CustodyStatusComponent,
    PdkCharacterCountComponent,
    FullNamePipe,
    ApplicantRespondentFullNamePipe,
    PdkComponents,
    TitleCasePipe,
    DatePipe
  ]
})
export class ViewHearingRowDetailsComponent implements OnInit {
  readonly hearing = input<Hearing>(undefined);
  readonly caseId = input<string>(undefined);
  readonly applicationId = input<string>(undefined);
  readonly offences = input<Offence[]>(undefined);
  readonly caseNotes = input<CaseNote[]>(undefined);
  readonly publicListNote = input<string>('');
  readonly getCaseNotes = output<string>();
  readonly updateHearingPublicListNote = output<Hearing>();
  listedCase: ListedCase;
  application: CourtApplication;
  inCustody: boolean;
  custodyDefendants: Defendant[];

  ngOnInit() {
    const caseId = this.caseId();
    if (caseId) {
      this.getCaseNotes.emit(caseId);
      const hearing = this.hearing();
      if (hearing.listedCases?.length > 0) {
        this.listedCase = (hearing.listedCases ?? []).find(({ id }) => id === this.caseId());
        this.custodyDefendants = this.listedCase?.defendants.filter(
          (def) => def.bailStatus?.code === 'C'
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

  onSubmitPublicListNote({ publicListNote }: { publicListNote: string }) {
    let updatedUnallocatedHearing = { ...this.hearing(), publicListNote };
    this.updateHearingPublicListNote.emit(updatedUnallocatedHearing);
  }
}
