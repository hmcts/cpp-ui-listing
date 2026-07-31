import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PdkMarginDirective, PdkFoldableTextComponent, PdkTypographyDirective } from '@cpp/pdk';
import { CPPDatePipe } from '../../shared/pipes/cpp-date.pipe';

@Component({
  selector: 'pinned-note',
  template: `
    <div pdk-margin-bottom="2">
      <pdk-foldable-text pdk-typography="body-medium">{{ note() }}</pdk-foldable-text>
      <div pdk-margin="0" pdk-typography="body-small">{{ firstName() }} {{ lastName() }}</div>
      <div pdk-margin="0" pdk-typography="body-small">
        {{ createdDateTime() | cppDate: 'D MMMM YYYY, h:mma' }}
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdkMarginDirective, PdkFoldableTextComponent, PdkTypographyDirective, CPPDatePipe]
})
export class PinnedNoteComponent {
  readonly firstName = input<string>(undefined);
  readonly lastName = input<string>(undefined);
  readonly note = input<string>(undefined);
  readonly createdDateTime = input<string>(undefined);
}
