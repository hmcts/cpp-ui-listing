import { ChangeDetectionStrategy, Component, OnInit, input, output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  CheckboxChangeEvent,
  PdkCheckboxComponent,
  PdkForm,
  PdkCheckBox,
  PdkCore,
  PdkTextInput,
  PdkInput,
  PdkButton
} from '@cpp/pdk';
import {
  Hearing,
  SearchAvailableHearingsFormOptions,
  SearchCriteriaAvailableHearingsType
} from '../../core';
import {
  requireCheckboxesToBeCheckedValidator,
  requireAtLeastOneSpecificCaseReference
} from './validators';

enum RelatedCaseTypes {
  sameCase = 'SAME_CASE',
  linkedCase = 'LINKED_CASE',
  specific = 'SPECIFIC_CASE'
}

interface FormData {
  caseTypes: RelatedCaseTypes[];
  specificCaseUrns: string[];
}
interface FormInterface {
  caseTypes: FormControl<string[]>;
  specificCaseUrns: FormArray<FormControl<string>>;
}
@Component({
  selector: 'find-available-hearing',
  templateUrl: './find-available-hearing.component.html',
  styles: [
    `
      .find-available-hearing-action-buttons {
        display: flex;
        align-items: center;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PdkForm,
    ReactiveFormsModule,
    PdkCheckBox,
    PdkCore,
    PdkTextInput,
    PdkInput,
    PdkButton
  ]
})
export class FindAvailableHearingComponent implements OnInit {
  readonly hearing = input<Hearing>(undefined);
  readonly onFindAvailableHearings = output<SearchAvailableHearingsFormOptions>();

  relatedHearingsForm: FormGroup<FormInterface>;
  relatedCaseTypes = RelatedCaseTypes;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.relatedHearingsForm = this.fb.group(
      {
        caseTypes: this.fb.control([], { validators: [requireCheckboxesToBeCheckedValidator()] }),
        specificCaseUrns: this.fb.array([this.fb.control(null)])
      },
      { validators: [requireAtLeastOneSpecificCaseReference()] }
    );
  }

  onSubmit(): void {
    const { caseTypes, specificCaseUrns } = this.relatedHearingsForm.value as FormData;
    let caseUrns: string[] = null;
    const searchCriterias = [];
    if (caseTypes.includes(this.relatedCaseTypes.sameCase)) {
      searchCriterias.push(SearchCriteriaAvailableHearingsType.CASE_IN_HEARING);
    }

    if (caseTypes.includes(this.relatedCaseTypes.linkedCase)) {
      searchCriterias.push(SearchCriteriaAvailableHearingsType.MATCHED_DEFENDANTS);
    }

    if (caseTypes.includes(this.relatedCaseTypes.specific)) {
      caseUrns = specificCaseUrns.filter((urn) => !!(urn && urn.trim())).map((urn) => urn.trim());
    }

    this.onFindAvailableHearings.emit({
      hearingId: this.hearing().id,
      jurisdictionType: this.hearing().jurisdictionType,
      caseUrns,
      searchCriterias
    });
  }

  get listedCasesUrns(): string {
    const hearing = this.hearing();
    if (hearing && hearing.listedCases) {
      return hearing.listedCases
        .map((listedCase) => listedCase.caseIdentifier.caseReference)
        .join(', ');
    }
  }

  get caseTypesValue(): RelatedCaseTypes[] {
    return this.relatedHearingsForm.get('caseTypes').value as RelatedCaseTypes[];
  }

  get specificCaseUrns() {
    return this.relatedHearingsForm.get('specificCaseUrns') as FormArray;
  }

  get isSearchButtonDisabled(): boolean {
    return this.relatedHearingsForm.invalid;
  }

  addAnotherSpecificCase(): void {
    this.specificCaseUrns.push(this.fb.control(null));
  }

  handleResetFilters(): void {
    this.relatedHearingsForm.reset();
    if (this.specificCaseUrns.length > 1) {
      this.reInitialiseFormArray();
    }
  }

  checkSpecificCases(
    { source, checked }: CheckboxChangeEvent,
    specificCaseOption: PdkCheckboxComponent
  ) {
    if (source === specificCaseOption && !checked) {
      this.specificCaseUrns.reset();

      if (this.specificCaseUrns.length > 1) {
        this.reInitialiseFormArray();
      }
    }
  }

  reInitialiseFormArray() {
    this.specificCaseUrns.clear();
    this.addAnotherSpecificCase();
  }
}
