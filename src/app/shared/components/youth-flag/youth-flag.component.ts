import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Defendant } from '../../../core/model/defendant';

import { PdkTypographyDirective, PdkTextColorDirective } from '@cpp/pdk';

@Component({
  selector: 'youth-flag',
  templateUrl: './youth-flag.component.html',
  styleUrls: ['./youth-flag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdkTypographyDirective, PdkTextColorDirective]
})
export class YouthFlagComponent {
  readonly defendants = input<Defendant[]>(undefined);

  hasYouthDedendant() {
    return this.defendants().some((defendant) => defendant.isYouth);
  }
}
