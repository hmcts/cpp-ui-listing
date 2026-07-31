import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CaseNote } from '../../../../allocate-hearing/allocate-hearing.interfaces';
import { PdkCore } from '@cpp/pdk';
import { DatePipe, NgClass } from '@angular/common';
@Component({
  selector: 'case-notes',
  templateUrl: './case-notes.html',
  styleUrls: ['./case-notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdkCore, DatePipe, NgClass]
})
export class CaseNotesComponent {
  readonly caseNotes = input<CaseNote[], CaseNote[]>([], {
    transform: (caseNotes: CaseNote[]) => {
      const pinnedNotes = (caseNotes ?? []).filter(({ isPinned }) => isPinned).slice(0, 10);
      const unpinnedNotes = (caseNotes ?? [])
        .filter(({ isPinned }) => !isPinned)
        .slice(0, 10 - pinnedNotes.length);
      return [...pinnedNotes, ...unpinnedNotes];
    }
  });

  readonly hasPinnedNotes = computed(() => this.caseNotes().some((note) => note.isPinned));
}
