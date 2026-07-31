import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChangeJudiciaryEvent } from '../../../model';
import { ExtendedJudicialRole, Hearing } from '../../../../core';
import { JudiciaryMemberNamesPipe } from '../../../../shared/pipes/judiciary-member-names.pipe';
import { PdkCore } from '@cpp/pdk';

@Component({
  selector: 'judiciary-header-cell',
  template: `
    <div style="display: flex">
      <h4 pdk-typography="heading-small" pdk-margin-bottom="0" data-test-id="judiciaryName">
        @if (judiciary().length > 0) {
          <span>{{ judiciary() | judiciaryMemberNames }}</span>
        }
        @if (judiciary().length <= 0) {
          <span>No judiciary allocated</span>
        }
      </h4>
      @if (editable()) {
        <a
          href="javascript:void(0)"
          (click)="onChangeJudiciary()"
          pdk-link
          unvisited
          pdk-typography="body"
          pdk-margin-left="3"
          pdk-margin-bottom="0"
          pdk-padding-right="2"
          >{{ judiciary().length > 0 ? 'Edit' : 'Add' }}</a
        >
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JudiciaryMemberNamesPipe, PdkCore]
})
export class JudiciaryHeaderCellComponent {
  readonly judiciary = input<ExtendedJudicialRole[]>(undefined);
  readonly courtRoomId = input<string>(undefined);
  readonly searchDate = input<string>(undefined);
  readonly hearing = input<Hearing>(undefined);
  readonly editable = input(false);
  readonly changeJudiciary = output<ChangeJudiciaryEvent>();

  onChangeJudiciary() {
    const judiciaryIds = (this.judiciary() ?? [])
      .map((judiciary) => judiciary.judicialId)
      .join(',');
    const courtCentreId = this.hearing().courtCentreId;
    this.changeJudiciary.emit({
      judiciaryIds,
      courtCentreId,
      courtRoomId: this.courtRoomId(),
      searchDate: this.searchDate()
    });
  }
}
