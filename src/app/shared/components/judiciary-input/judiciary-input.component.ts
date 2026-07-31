import { ChangeDetectionStrategy, Component, Input, ViewChild, input, output } from '@angular/core';
import { ExtendedJudicialRole, JudicialRoleType } from '../../../core';
import { JudiciaryTypeaheadComponent } from '../judiciary-typeahead/judiciary-typeahead.component';
import { JudicialMember, JudiciaryTypeGroup } from '@cpp/reference-data';
import { NgClass } from '@angular/common';
import {
  PdkTypographyDirective,
  PdkMarginDirective,
  PdkFormFieldComponent,
  PdkCheckboxGroupComponent,
  PdkCheckboxComponent,
  PdkCheckboxConditionalComponent
} from '@cpp/pdk';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'judiciary-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset style="margin-bottom: 0" [ngClass]="{ 'no-border': removeBorder() }">
      <legend
        pdk-typography="heading-small"
        pdk-margin-bottom="0"
        [ngClass]="{ 'no-border': removeBorder() }"
      >
        {{ removeBorder() ? 'Edit judiciary' : 'Judiciary ' + (required() ? '' : '(Optional)') }}
      </legend>
      <pdk-form-field label="Judiciary" labelType="none" pdk-margin-bottom="1">
        <pdk-checkbox-group
          name="judicialRoleType"
          [ngModel]="checkBoxModel"
          [ngModelOptions]="{ standalone: true }"
          (ngModelChange)="updateJudiciaryMap($event); checkBoxModel = $event"
          [required]="required()"
        >
          @for (judgeType of judgeTypes; track judgeType.label) {
            <pdk-checkbox [value]="judgeType.value">
              {{ judgeType.label }}
            </pdk-checkbox>
            @if (checkBoxModel.includes(judgeType.value)) {
              <pdk-checkbox-conditional>
                <div pdk-typography="body-medium" pdk-margin-bottom="1" aria-hidden="true">
                  Name
                </div>
                <pdk-form-field [label]="judgeType.formLabel" labelType="none">
                  <judiciary-typeahead
                    [attr.data-test-id]="judgeType.value"
                    [name]="'judiciary' + judgeType.value"
                    [judiciaryType]="judgeType.value"
                    [maxInputWidth]="maxInputWidth()"
                    [ngModel]="judicialMap[judgeType.value]?.judicialMember"
                    [ngModelOptions]="{ standalone: true }"
                    (ngModelChange)="setJudge($event, judgeType.value)"
                  >
                  </judiciary-typeahead>
                </pdk-form-field>
              </pdk-checkbox-conditional>
            }
          }

          <pdk-checkbox
            [ngModel]="true"
            value="MAGISTRATE"
            style="margin-bottom: 10px"
            [ngModelOptions]="{ standalone: true }"
          >
            Magistrates
          </pdk-checkbox>

          @if (checkBoxModel.includes('MAGISTRATE')) {
            <pdk-checkbox-conditional>
              <pdk-form-field label="Chair">
                <judiciary-typeahead
                  name="lead-magistrate"
                  judiciaryType="MAGISTRATE"
                  [maxInputWidth]="maxInputWidth()"
                  [ngModel]="judicialMap.magistrates[0]?.judicialMember"
                  (ngModelChange)="setMagistrate($event, 0)"
                  [ngModelOptions]="{ standalone: true }"
                  required
                >
                </judiciary-typeahead>
              </pdk-form-field>
              <pdk-form-field label="Winger 1">
                <judiciary-typeahead
                  name="winger1"
                  judiciaryType="MAGISTRATE"
                  [maxInputWidth]="maxInputWidth()"
                  [ngModel]="judicialMap.magistrates[1]?.judicialMember"
                  (ngModelChange)="setMagistrate($event, 1)"
                  [ngModelOptions]="{ standalone: true }"
                  required
                >
                </judiciary-typeahead>
              </pdk-form-field>
              <pdk-form-field label="Winger 2">
                <judiciary-typeahead
                  #winger2JudiciaryTypeahead
                  name="winger2"
                  judiciaryType="MAGISTRATE"
                  [maxInputWidth]="maxInputWidth()"
                  [ngModel]="judicialMap.magistrates[2]?.judicialMember"
                  (ngModelChange)="setMagistrate($event, 2)"
                  [ngModelOptions]="{ standalone: true }"
                  [required]="isWinger2FieldRequired()"
                >
                </judiciary-typeahead>
              </pdk-form-field>
            </pdk-checkbox-conditional>
          }
        </pdk-checkbox-group>
      </pdk-form-field>
    </fieldset>
  `,
  styles: [
    `
      ::ng-deep .pdk-autosuggest__suggestions-container--open {
        width: 280px;
        max-width: 38ex;
        height: auto;
        max-height: 300px;
        overflow-y: scroll;
      }
      .no-border {
        border: 0;
        margin-left: -15px;
      }
    `
  ],
  imports: [
    NgClass,
    PdkTypographyDirective,
    PdkMarginDirective,
    PdkFormFieldComponent,
    PdkCheckboxGroupComponent,
    FormsModule,
    PdkCheckboxComponent,
    PdkCheckboxConditionalComponent,
    JudiciaryTypeaheadComponent
  ]
})
export class JudiciaryInputComponent {
  readonly maxInputWidth = input<number>(undefined);
  @Input()
  get judiciary(): ExtendedJudicialRole[] {
    return this._judiciary;
  }
  set judiciary(judiciary: ExtendedJudicialRole[]) {
    this._judiciary = [...(judiciary ?? [])];
    this.judicialMap = this.toJudicialMap(this._judiciary);
    this.checkBoxModel = this.toCheckBoxModel(this._judiciary);
  }

  readonly judiciaryChange = output<ExtendedJudicialRole[]>();

  readonly required = input<boolean>(undefined);
  readonly removeBorder = input<boolean>(false);

  @ViewChild('winger2JudiciaryTypeahead')
  winger2JudiciaryTypeaheadRef: JudiciaryTypeaheadComponent;

  private _judiciary: ExtendedJudicialRole[];
  judicialMap;
  checkBoxModel: string[] = [];

  judgeTypes: {
    value: JudiciaryTypeGroup;
    label: string;
    formLabel: string;
  }[] = [
    { value: 'CIRCUIT_JUDGE', label: 'Judge', formLabel: 'Circuit judge' },
    { value: 'DISTRICT_JUDGE', label: 'District Judge', formLabel: 'District Judge' },
    {
      value: 'DEPUTY_DISTRICT_JUDGE',
      label: 'Deputy District Judge',
      formLabel: 'Deputy District Judge'
    },
    { value: 'RECORDER', label: 'Recorder', formLabel: 'Recorder' }
  ];

  setMagistrate(judicialMember: JudicialMember, index: number) {
    this.setMagistrateAtIndex(index, {
      judicialMember,
      judicialRoleType: { judiciaryType: 'MAGISTRATE' },
      isBenchChairman: index === 0,
      isDeputy: index !== 0
    });

    this.updateJudiciaries(this.judicialMap);
  }

  setJudge(judicialMember: JudicialMember, judiciaryType: JudiciaryTypeGroup) {
    if (judicialMember) {
      this.judicialMap = {
        ...this.judicialMap,
        [judiciaryType]: {
          judicialMember,
          judicialRoleType: { judiciaryType },
          judicialId: judicialMember.id
        }
      };
    } else {
      this.judicialMap = { ...this.judicialMap, [judiciaryType]: undefined };
    }
    this.updateJudiciaries(this.judicialMap);
  }

  isWinger2FieldRequired(): boolean {
    return (
      !!this.winger2JudiciaryTypeaheadRef &&
      !!this.winger2JudiciaryTypeaheadRef.autoSuggest.inputValue.trim()
    );
  }

  updateJudiciaryMap(newCheckBoxModel: string[]) {
    let judicialMap = { magistrates: [] };
    if (newCheckBoxModel.includes('MAGISTRATE')) {
      judicialMap = { magistrates: this.judicialMap['magistrates'] };
    }
    this.judicialMap = newCheckBoxModel.reduce((map, modelItem) => {
      return {
        ...map,
        [modelItem]: this.judicialMap[modelItem]
      };
    }, judicialMap);
    this.updateJudiciaries(this.judicialMap);
  }

  private toCheckBoxModel(judiciary: ExtendedJudicialRole[]): string[] {
    return judiciary.map((judic) => judic.judicialRoleType.judiciaryType);
  }

  private toJudicialMap(judiciary: ExtendedJudicialRole[]): any {
    const judicialMap = {
      magistrates: judiciary.filter(
        (judic) => judic.judicialRoleType.judiciaryType === 'MAGISTRATE'
      )
    };

    return this.judgeTypes.reduce((map, judgeType) => {
      return {
        ...map,
        [judgeType.value]: judiciary.find(
          ({ judicialRoleType }) => judicialRoleType.judiciaryType === judgeType.value
        )
      };
    }, judicialMap);
  }

  private updateJudiciaries(judiciaryMap: any) {
    this._judiciary.length = 0;
    if (judiciaryMap.magistrates) {
      const args = [0, this._judiciary.length].concat(judiciaryMap.magistrates);
      Array.prototype.splice.apply(this._judiciary, args);
    }

    this.judgeTypes.forEach((judiciaryType) => {
      if (judiciaryMap[judiciaryType.value]) {
        this._judiciary.splice(0, 0, judiciaryMap[judiciaryType.value]);
      }
    });

    this.judiciaryChange.emit(this._judiciary);
  }

  // While the judicial roles are modelled with an identity in the template
  // (Circuit Judge, Recorder etc), they are, ultimately, just a judicial role
  // entry in an array. Therefore, setting any of these identities is a case of
  // pushing the entry to the array at a desired index.
  private setMagistrateAtIndex(
    idx: number,
    value: {
      judicialMember: JudicialMember;
      judicialRoleType: JudicialRoleType;
      isDeputy?: boolean;
      isBenchChairman?: boolean;
    }
  ) {
    // If the user is attemping to set a `JudicialRole` out of order (at an
    // index that cannot yet be set), we must stub the indexes up to that point.
    // By setting an undefined entry here, the `required` check still fails on
    // the ngModel, but the `data` model can reach set the required index
    for (let i = 0; i < idx; i++) {
      if (!this.judicialMap.magistrates[i]) {
        this.judicialMap.magistrates.splice(i, 1, undefined);
      }
    }
    // If the incoming value does not have a `judicialMember`, the user has
    // cleared the input and therefore we nullify its entry, otherwise we set
    // the value at the designated index.
    const { judicialMember } = value;

    this.judicialMap.magistrates.splice(
      idx,
      1,
      judicialMember ? { ...value, judicialId: judicialMember.id } : undefined
    );

    // clean up any unrequired `undefined` entries from the `judiciary` array
    for (let i = this.judicialMap.magistrates.length - 1; i >= 0; i--) {
      if (!this.judicialMap.magistrates[i]) {
        this.judicialMap.magistrates.splice(i, 1);
        continue;
      }
      break;
    }
  }
}
