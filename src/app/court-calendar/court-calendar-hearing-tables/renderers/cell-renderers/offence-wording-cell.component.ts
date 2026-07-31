import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PdkCore } from '@cpp/pdk';
import { PlusMorePipe } from '../../../pipes/plus-more.pipe';

@Component({
  selector: 'offence-wording-cell',
  template: `
    <div data-test-id="offences" class="offences">
      <span [pdk-margin-bottom]="1"> {{ displayOffence }}</span>
      @if (otherOffences?.length > 0) {
        <span>
          {{ otherOffences | plusMore }}
        </span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['offenceWordings'],
  imports: [PlusMorePipe, PdkCore],
  styles: [
    `
      .offences {
        display: flex;
        flex-direction: column;
      }
    `
  ]
})
export class OffenceWordingCellComponent implements OnInit {
  offenceWordings: string[];
  displayOffence: string;
  otherOffences: string[];

  ngOnInit(): void {
    this.displayOffence = (this.offenceWordings ?? [])[0] ?? '';
    this.otherOffences = this.offenceWordings?.slice(1) ?? [];
  }
}
