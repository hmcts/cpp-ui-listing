import { Component, input, output } from '@angular/core';
import { PdkButton, PdkCore, PdkForm, PdkRadio, ValidationError } from '@cpp/pdk';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'courtroom-change-confirmation-form',
  templateUrl: './courtroom-change-confirmation-form.component.html',
  imports: [PdkRadio, PdkForm, PdkCore, FormsModule, PdkButton]
})
export class CourtroomChangeConfirmationFormComponent {
  readonly confirmationLabel = input<string>('Are you sure you want to change courtroom?');
  readonly labelType = input<string>('medium');
  readonly yesText = input<string>('Yes');
  readonly noText = input<string>('No');
  readonly submitButtonText = input<string>('Continue');
  readonly submitAriaLabel = input<string>('continue');
  readonly submitDisabled = input<boolean>(false);
  readonly testId = input<string>('hearingDetailsForm');
  readonly fieldName = input<string>('changeCourtRoom');
  readonly errorMessages = input<any[]>([
    {
      rule: 'required',
      message: 'Select an change courtroom option'
    }
  ]);

  readonly onValidationError = output<ValidationError[]>();
  readonly onFormSubmit = output<{
    changeCourtRoom: boolean;
  }>();
}
