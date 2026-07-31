import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PdkModule } from '@cpp/pdk';
import { PlusMorePipe } from '../../pipes/plus-more.pipe';

@Component({
  selector: 'offence-wording-cell',
  template: `
    <div data-test-id="offences" class="offences">
      <span [pdk-margin-bottom]="1"> {{ displayOffence }}</span>
      <span *ngIf="otherOffences?.length > 0">
        {{ otherOffences | plusMore }}
      </span>
    </div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['offenceWordings'],
  imports: [CommonModule, PlusMorePipe, PdkModule],
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
