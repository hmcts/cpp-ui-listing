import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { ApplicantRespondent, Defendant } from '../../../../core';
import { HearingDefendantVM } from '../../../../court-calendar/model';
import { SharedModule } from '../../../../shared';
import { PlusMorePipe } from '../../pipes/plus-more.pipe';

@Component({
  selector: 'defendant-cell',
  template: `
    <div data-test-id="defendants" class="defendants">
      <ng-container *ngIf="displayDefendants?.length > 0; else application">
        <span
          *ngFor="let defendant of displayDefendants"
          data-test-id="defendant"
          [pdk-margin-bottom]="1"
        >
          {{ defendant | fullName
          }}{{
            defendant.isYouth && defendant.bailStatus?.code === 'C'
              ? ' (Y, C)'
              : defendant.isYouth
              ? ' (Y)'
              : defendant.bailStatus?.code === 'C'
              ? ' (C)'
              : ''
          }}</span
        >
        <span *ngIf="otherDefendants.length > 0">
          {{ otherDefendants | plusMore }}
        </span>
        <div>
          <a
            pdk-link
            class="hearing-reference"
            pdk-typography="caption-medium"
            data-test-id="hearingReference"
            target="_blank"
            href="{{ baseUrl }}/prosecution-casefile/case-at-a-glance/{{ defendantData.caseId }}"
            ><span pdk-visually-hidden>Case reference</span> {{ defendantData.caseUrn }}</a
          >
        </div>
      </ng-container>
    </div>
    <ng-template #application>
      <ng-container *ngIf="hasRespondents || !!applicant">
        <span
          *ngFor="let respondent of displayRespondents"
          data-test-id="defendant"
          [pdk-margin-bottom]="1"
        >
          {{ respondent | applicantRespondentFullName }}</span
        >
        <span *ngIf="otherRespondents?.length > 0">
          {{ otherRespondents | plusMore }}
        </span>

        <span *ngIf="!hasRespondents && !!applicant">
          {{ applicant | applicantRespondentFullName }}
        </span>
        <div>
          <a
            pdk-link
            class="hearing-reference"
            pdk-typography="caption-medium"
            data-test-id="hearingReference"
            target="_blank"
            href="{{ baseUrl }}/prosecution-casefile/application-at-a-glance/{{
              defendantData.applicationId
            }}"
            ><span pdk-visually-hidden>Application reference</span>
            {{ defendantData.applicationReference }}</a
          >
        </div>
      </ng-container>
    </ng-template>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['defendantData', 'baseUrl'],
  imports: [CommonModule, PlusMorePipe, SharedModule],
  styles: [
    `
      .defendants {
        display: flex;
        flex-direction: column;
      }
    `
  ]
})
export class DefendantCellComponent implements OnInit {
  defendantData: HearingDefendantVM;
  baseUrl: string;
  displayDefendants: Defendant[];
  otherDefendants: Defendant[];
  displayRespondents: ApplicantRespondent[];
  otherRespondents: ApplicantRespondent[];
  applicant: ApplicantRespondent;

  get hasRespondents() {
    return this.defendantData.applicationParties?.respondents.length > 0 ?? false;
  }

  ngOnInit(): void {
    this.displayDefendants = this.defendantData.defendants?.slice(0, 4);
    this.otherDefendants = this.defendantData.defendants?.slice(4);
    this.displayRespondents = this.defendantData.applicationParties?.respondents?.slice(0, 4);
    this.otherRespondents = this.defendantData.applicationParties?.respondents?.slice(4);
    this.applicant = this.defendantData.applicationParties?.applicant;
  }

  @HostListener('click', ['$event'])
  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }
}
