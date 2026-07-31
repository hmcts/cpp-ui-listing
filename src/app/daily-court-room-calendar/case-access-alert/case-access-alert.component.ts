import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CaseAccessAlertService } from './case-access-alert.service';
import { CaseAccessModalComponent } from './case-access-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'case-access-alert',
  template: `
    <case-access-modal
      [urns]="urns()"
      [show]="shouldShowModal"
      (onSubmit)="onSubmit($event)"
      (onCancel)="onCancel.emit()"
    >
    </case-access-modal>
  `,
  imports: [CaseAccessModalComponent],
  providers: [CaseAccessAlertService]
})
export class CaseAccessAlertComponent {
  readonly urns = input<string[]>([]);
  readonly userId = input<string>(undefined);
  readonly hearingIds = input<string[]>([]);
  readonly selectedHearingId = input<string>(undefined);
  readonly searchDate = input<string>(undefined);
  readonly onCancel = output<void>();

  get shouldShowModal(): boolean {
    return this.alertService.shouldShowModal(
      this.hearingIds(),
      this.userId(),
      this.selectedHearingId(),
      this.searchDate()
    );
  }

  constructor(private alertService: CaseAccessAlertService) {}

  onSubmit(decision: boolean) {
    if (decision) {
      this.alertService.saveDecision(this.hearingIds(), this.userId());
    }
  }
}
