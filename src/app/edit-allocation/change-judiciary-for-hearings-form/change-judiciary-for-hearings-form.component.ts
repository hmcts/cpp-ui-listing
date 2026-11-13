import { Component, SimpleChanges, OnChanges, input, output } from '@angular/core';

import {
  ExtendedJudicialRole,
  JudicialRoleType,
  Hearing,
  CourtCentre,
  HearingWithSelectedCourtCentre,
  JudiciaryAssignmentSource
} from '../../core';
import {
  ValidationError,
  PdkFormComponent,
  PdkTypographyDirective,
  PdkMarginDirective,
  PdkButtonComponent,
  PdkButtonDirective,
  PdkLinkDirective
} from '@cpp/pdk';
import { FormsModule } from '@angular/forms';
import { JudiciaryInputComponent } from '../../shared/components/judiciary-input/judiciary-input.component';
import { resolveJudiciaryAssignmentSource } from '../../core/util';

interface JudiciaryModel {
  judiciary: ExtendedJudicialRole[];
  judicialRoleType: JudicialRoleType | null;
}

interface ChangeJudiciary {
  hearings: HearingWithSelectedCourtCentre[];
  judiciary: ExtendedJudicialRole[];
  judiciaryAssignmentSource?: JudiciaryAssignmentSource;
}

@Component({
  selector: 'change-judiciary-for-hearings-form',
  templateUrl: './change-judiciary-for-hearings-form.component.html',
  imports: [
    FormsModule,
    PdkFormComponent,
    PdkTypographyDirective,
    PdkMarginDirective,
    JudiciaryInputComponent,
    PdkButtonComponent,
    PdkButtonDirective,
    PdkLinkDirective
  ]
})
export class ChangeJudiciaryForHearingsFormComponent implements OnChanges {
  readonly maxInputWidth = input<number>(undefined);
  readonly hearings = input<Hearing[]>(undefined);
  readonly courtCentres = input<CourtCentre[]>(undefined);

  readonly onSubmit = output<ChangeJudiciary>();
  readonly onCancel = output<void>();
  readonly onValidationError = output<ValidationError[]>();

  data: JudiciaryModel = { judiciary: [], judicialRoleType: null };
  selectedJudiciary: ExtendedJudicialRole[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hearings?.currentValue?.length > 0) {
      const [firstHearing] = changes.hearings?.currentValue as Hearing[];
      const judiciary = [...(firstHearing.judiciary ?? [])].filter(judic => !!judic); // this is to handle gaps in magistrates (eg Winger 2 present but not Winger 1, etc)
      this.data = {
        judiciary,
        judicialRoleType: judiciary[0] ? judiciary[0].judicialRoleType : null
      };
    }
  }

  submit() {
    const changedJudicary = {
      hearings: this.mapCourtCentresToHearings(this.hearings()),
      judiciary: this.selectedJudiciary ?? this.data?.judiciary ?? [],
      judiciaryAssignmentSource: resolveJudiciaryAssignmentSource(
        this.hearings()?.[0]?.jurisdictionType,
        this.selectedJudiciary
      )
    };

    this.onSubmit.emit(changedJudicary);
  }

  cancel() {
    this.onValidationError.emit(null);
    this.onCancel.emit();
  }

  mapCourtCentresToHearings(hearings: Hearing[]): HearingWithSelectedCourtCentre[] {
    return hearings.map(hearing => {
      const selectedCourtCentre = this.courtCentres().find(cc => cc.id === hearing.courtCentreId);
      return {
        ...hearing,
        selectedCourtCentre: {
          id: selectedCourtCentre?.id,
          courtRoomId: selectedCourtCentre?.courtRooms[0]?.id,
          courtCentreName: selectedCourtCentre?.name
        }
      };
    });
  }
}
