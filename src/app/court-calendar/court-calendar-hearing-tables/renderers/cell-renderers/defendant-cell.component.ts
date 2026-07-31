import { ChangeDetectionStrategy, Component, HostListener, inject, OnInit } from '@angular/core';
import { PdkCore } from '@cpp/pdk';
import { ApplicantRespondent, Defendant } from '../../../../core';
import { ApplicantRespondentFullNamePipe } from '../../../../shared/pipes/applicant-respondent-full-name.pipe';
import { FullNamePipe } from '../../../../shared/pipes/full-name.pipe';
import { HearingDefendantVM } from '../../../model';
import { PlusMorePipe } from '../../../pipes/plus-more.pipe';
import { WofdWarningService } from '@cpp/application';

@Component({
  selector: 'defendant-cell',
  template: `
    <div data-test-id="defendants" class="defendants">
      @if (displayDefendants?.length > 0) {
        @for (defendant of displayDefendants; track defendant.id) {
          <span class="defendant-name" data-test-id="defendant" [pdk-margin-bottom]="1">
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
        }
        @if (otherDefendants.length > 0) {
          <span>
            {{ otherDefendants | plusMore }}
          </span>
        }
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
      } @else {
        @if (hasRespondents || !!applicant) {
          @for (respondent of displayRespondents; track respondent.id) {
            <span data-test-id="defendant" [pdk-margin-bottom]="1">
              {{ respondent | applicantRespondentFullName }}</span
            >
          }
          @if (otherRespondents?.length > 0) {
            <span>
              {{ otherRespondents | plusMore }}
            </span>
          }
          @if (!hasRespondents && !!applicant) {
            <span>
              {{ applicant | applicantRespondentFullName }}
            </span>
          }
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
              (click)="onApplicationClick($event)"
              ><span pdk-visually-hidden>Application reference</span>
              {{ defendantData.applicationReference }}</a
            >
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['defendantData', 'baseUrl'],
  imports: [PlusMorePipe, ApplicantRespondentFullNamePipe, FullNamePipe, PdkCore],
  styles: [
    `
      .defendants {
        display: flex;
        flex-direction: column;
        max-width: 100%;
      }

      .defendant-name {
        word-break: break-word;
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

  private readonly wofdWarningService = inject(WofdWarningService);

  get hasRespondents() {
    return (this.defendantData.applicationParties?.respondents.length ?? 0) > 0;
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

  onApplicationClick(event: Event): void {
    const isWofd = this.wofdWarningService.isWofdApplication([
      { code: this.defendantData.applicationTypeCode }
    ]);

    if (isWofd) {
      event.preventDefault();
      this.wofdWarningService.showModal({
        onProceed: () => {
          window.open(
            `${this.baseUrl}/prosecution-casefile/application-at-a-glance/${this.defendantData.applicationId}`,
            '_blank'
          );
        }
      });
    }
  }
}
