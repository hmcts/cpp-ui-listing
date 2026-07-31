import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnDestroy,
  ViewChild,
  input,
  output
} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import {
  PdkPaddingDirective,
  PdkAlertComponent,
  PdkTypographyDirective,
  PdkMarginDirective,
  PdkListDirective,
  PdkFormComponent,
  PdkFormFieldComponent,
  PdkRadioGroupComponent,
  PdkRadioButtonComponent,
  PdkButtonComponent,
  PdkButtonDirective,
  PdkLinkDirective
} from '@cpp/pdk';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'case-access-modal',
  template: `
    @if (show()) {
      <div bsModal class="modal fade in" [config]="modalConfig" role="alertdialog">
        <div class="modal-dialog">
          <div class="modal-content">
            <div pdk-padding="4">
              <pdk-alert icon="true" type="warning" pdk-typography="body-medium">
                Cases listed for hearing today
              </pdk-alert>
              <p pdk-typography="body-medium" pdk-margin-top="4">
                Changing anything could affect the judicial decision for the following cases:
              </p>
              <ul pdk-list="bullet" class="urn-list" data-test-id="alertUrnList">
                @for (urn of urns(); let index = $index; track index) {
                  <li class="bold">
                    {{ urn }}
                  </li>
                }
              </ul>
              <form
                #form="ngForm"
                pdk-form
                novalidate
                (validSubmit)="submitDecision(form.value.hasTodayHearing)"
                data-test-id="caseAlertForm"
              >
                <pdk-form-field label="Select why you need access">
                  <pdk-radio-group name="hasTodayHearing" data-role="access-decision" ngModel>
                    <pdk-radio-button [value]="true">
                      I'm administering the hearing today
                    </pdk-radio-button>
                    <pdk-radio-button [value]="false">
                      I need access but I'm not running today's hearing
                    </pdk-radio-button>
                  </pdk-radio-group>
                </pdk-form-field>
                <div class="button-holder">
                  <button pdk-button pdk-margin-bottom="0" type="submit" [disabled]="!form.touched">
                    Continue
                  </button>
                  <a pdk-link pdk-margin-left="4" href="javascript:void(0);" (click)="cancel()">
                    Cancel
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .button-holder {
        display: flex;
        align-items: center;
      }

      .urn-list {
        max-height: 250px;
        overflow-y: auto;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModalDirective,
    PdkPaddingDirective,
    PdkAlertComponent,
    PdkTypographyDirective,
    PdkMarginDirective,
    PdkListDirective,
    FormsModule,
    PdkFormComponent,
    PdkFormFieldComponent,
    PdkRadioGroupComponent,
    PdkRadioButtonComponent,
    PdkButtonComponent,
    PdkButtonDirective,
    PdkLinkDirective
  ]
})
export class CaseAccessModalComponent implements OnChanges, AfterViewInit, OnDestroy {
  readonly modalConfig = {
    show: true,
    backdrop: true,
    ignoreBackdropClick: true,
    keyboard: false
  };

  readonly urns = input<string[]>(undefined);
  readonly show = input<boolean>(undefined);
  readonly onSubmit = output<boolean>();
  readonly onCancel = output<void>();
  @ViewChild(ModalDirective) modal: ModalDirective;
  hiddenSubscription: Subscription;

  ngOnChanges(): void {
    if (this.show() && this.modal) {
      this.modal.show();
    }
  }

  ngAfterViewInit(): void {
    if (this.show() && this.modal) {
      this.hiddenSubscription = this.modal.onHide.subscribe(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
    }
  }

  submitDecision(decision: boolean) {
    this.onSubmit.emit(decision);
    this.modal.hide();
  }

  cancel() {
    this.modal.hide();
    // TODO: The 'emit' function requires a mandatory void argument
    this.onCancel.emit();
  }

  ngOnDestroy(): void {
    this.hiddenSubscription?.unsubscribe();
  }
}
