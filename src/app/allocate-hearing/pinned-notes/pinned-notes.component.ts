import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AggregatedCaseNotes } from '../../core/selectors';
import { Defendant } from '../../core/model';

import { PdkMarginDirective, PdkDividerComponent, PdkGrid } from '@cpp/pdk';
import { PinnedNoteComponent } from './pinned-note.component';
import { FindFirstDefendantAlphabeticallyPipe } from '../../shared/pipes/find-first-defendant-alphabetically.pipe';
import { FullNamePipe } from '../../shared/pipes/full-name.pipe';

@Component({
  selector: 'pinned-notes',
  template: `
    @if (pinnedCaseNotes()?.length) {
      <dl>
        <div pdk-grid container pdk-margin-bottom="2">
          <dt pdk-grid one-third><b>Pinned case notes</b></dt>
          <dd pdk-grid two-thirds>
            @for (
              pinnedCaseNote of pinnedCaseNotes();
              let pinnedNoteIndex = $index;
              track pinnedNoteIndex
            ) {
              <div pdk-margin-bottom="2">
                <div pdk-margin-bottom="1">
                  <b>
                    {{ pinnedCaseNote.caseDetails.caseIdentifier.caseReference }}&nbsp;
                    {{
                      pinnedCaseNote.caseDetails.defendants
                        | findFirstDefendantAlphabetically
                        | fullName
                    }}
                    @if (pinnedCaseNote.caseDetails.defendants?.length > 1) {
                      {{ plusOtherDefendants(pinnedCaseNote.caseDetails.defendants) }}
                    }
                  </b>
                </div>
                @for (caseNote of pinnedCaseNote.caseNotes; track caseNote.id; let i = $index) {
                  <pinned-note
                    [firstName]="caseNote?.author.firstName"
                    [lastName]="caseNote?.author.lastName"
                    [note]="caseNote?.note"
                    [createdDateTime]="caseNote?.createdDateTime"
                  >
                  </pinned-note>
                }
              </div>
            }
          </dd>
        </div>
      </dl>
    }
    <pdk-divider></pdk-divider>
  `,
  styles: [
    `
      dt,
      dd {
        display: block;
        margin: 0;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkGrid,
    PdkMarginDirective,
    PinnedNoteComponent,
    PdkDividerComponent,
    FindFirstDefendantAlphabeticallyPipe,
    FullNamePipe
  ]
})
export class PinnedNotesComponent {
  readonly pinnedCaseNotes = input<AggregatedCaseNotes[]>(undefined);

  plusOtherDefendants(defendants: Defendant[]): string {
    let result = '';
    if (defendants && defendants.length > 1) {
      result = `+ ${defendants.length - 1} other`;
      if (defendants.length > 2) {
        result += 's';
      }
    }
    return result;
  }
}
