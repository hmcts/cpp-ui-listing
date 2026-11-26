import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  ViewChild,
  forwardRef,
  OnDestroy,
  input
} from '@angular/core';
import {
  NgControl,
  NgForm,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  AbstractControl,
  ValidationErrors,
  NG_VALIDATORS,
  Validator
} from '@angular/forms';
import { Subject } from 'rxjs';
import { auditTime, filter, map, switchMap } from 'rxjs/operators';
import {
  FormFieldControl,
  PdkAutosuggestLiteComponent,
  coerceBooleanProperty,
  generateId
} from '@cpp/pdk';
import {
  JudicialMember,
  ReferenceDataService,
  JudiciaryTypeGroup,
  judiciaryTypeGroupToJudiciaryTypePayload
} from '@cpp/reference-data';
import { AsyncPipe } from '@angular/common';

export interface JudiciaryAutoSuggestOption extends JudicialMember {
  judicialMemberName: string;
}

@Component({
  selector: 'judiciary-typeahead',
  templateUrl: './judiciary-typeahead.component.html',
  styleUrls: ['./judiciary-typeahead.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JudiciaryTypeaheadComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => JudiciaryTypeaheadComponent),
      multi: true
    },
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => JudiciaryTypeaheadComponent)
    }
  ],
  imports: [PdkAutosuggestLiteComponent, AsyncPipe]
})
export class JudiciaryTypeaheadComponent
  implements ControlValueAccessor, FormFieldControl, Validator, OnDestroy
{
  @Input() id = generateId('judicial-typeahead');
  readonly maxInputWidth = input(10);
  @Input() ariaDescribedBy: string | null = undefined;
  readonly judiciaryType = input<JudiciaryTypeGroup>(undefined);
  @ViewChild('autosuggest', { static: true })
  autoSuggest: PdkAutosuggestLiteComponent<JudiciaryAutoSuggestOption>;
  readonly required = input(false, {
    transform: (value: boolean | string) => coerceBooleanProperty(value)
  });

  input$ = new Subject<any>();
  source$ = new Subject<JudiciaryAutoSuggestOption[]>();

  selectedJudicialMember: JudiciaryAutoSuggestOption;
  controlType = 'typeahead';
  hasError = false;
  noResult = false;
  multi = false;

  private propagateChange: (_: any) => void = (_: any) => {};

  constructor(
    private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private ngForm: NgForm,
    refDataService: ReferenceDataService
  ) {
    this.input$
      .pipe(
        filter(text => text.length > 1),
        auditTime(250),
        switchMap(text =>
          refDataService.fetchJudicialMembers({
            search: text,
            limit: 50,
            judiciaryGroup: judiciaryTypeGroupToJudiciaryTypePayload(this.judiciaryType())
          })
        ),
        map(judicialMembers =>
          judicialMembers.map(
            judicialMember =>
              ({
                ...judicialMember,
                judicialMemberName: `${judicialMember.forenames} ${judicialMember.surname}`
              }) as JudiciaryAutoSuggestOption
          )
        )
      )
      .subscribe(this.source$);
    (ngForm as any).ngSubmit.subscribe(() => {
      this.hasError = Boolean(this.ngControl.errors);

      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (!!this.ngForm.controls[this.ngControl.name]) {
      this.ngForm.controls[this.ngControl.name].setErrors(undefined);
    }
  }

  get ngControl() {
    return this.injector.get(NgControl);
  }

  onSelect(match: JudiciaryAutoSuggestOption) {
    const judicialMember = match as JudicialMember;
    this.propagateChange(judicialMember);
  }

  validate(c: AbstractControl): ValidationErrors | null {
    if (this.required() && !c.value) {
      return { required: { actual: c.value } };
    }
    return null;
  }

  writeValue(value: JudicialMember): void {
    if (this.autoSuggest && value) {
      this.selectedJudicialMember = {
        ...value,
        judicialMemberName: `${value.forenames} ${value.surname}`
      };
      this.autoSuggest.writeValue(this.selectedJudicialMember);
    }
  }

  registerOnChange = (fn: (_: any) => void) => {
    this.propagateChange = fn.bind(this);

    fn = (autoSuggest: JudiciaryAutoSuggestOption) => {
      const judicialMember = autoSuggest as JudicialMember;
      this.propagateChange(judicialMember);
    };

    this.autoSuggest.registerOnChange(fn);
  };

  registerOnTouched(fn: (_: unknown) => void): void {}
}
