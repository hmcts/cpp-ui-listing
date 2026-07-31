import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewChild,
  input,
  output
} from '@angular/core';
import {
  ValidationError,
  PdkErrorSummaryComponent,
  PdkMarginDirective,
  PdkPaddingDirective,
  PdkInsetTextComponent
} from '@cpp/pdk';
import { HearingType, OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import {
  ALLOCATION_FORM_CONFIGS,
  AllocationsFormConfig,
  CrownSchedulingFilters,
  CrownSchedulingFiltersComponent,
  CrownSchedulingSlotsComponent,
  CrownSessionStatus,
  HearingSlot,
  SchedulingSlotAllocationSubmit
} from '@cpp/scheduling';

@Component({
  selector: 'crown-scheduling',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let filterValues = filters();
    @if (errors) {
      <pdk-error-summary [errors]="errors"></pdk-error-summary>
    }
    <div pdk-margin-bottom="6" pdk-padding-left="6" pdk-padding-right="6">
      <crown-scheduling-filters
        [defaultSessionStatus]="CrownSessionStatus.FINAL"
        [organisationUnits]="organisationUnits()"
        [rotaBusinessTypes]="rotaBusinessTypes()"
        [defaultValues]="filterValues"
        (filtersSubmit)="handleSubmitFilters($event)"
        (errors)="errors = $event"
      >
      </crown-scheduling-filters>
    </div>
    <div pdk-padding-left="6" pdk-padding-right="6">
      @if (totalResults() > -1) {
        <pdk-inset-text>
          <b
            >{{ totalResults() }} session{{ totalResults() === 1 ? '' : 's' }} found. Only sessions
            with available time or slots are returned</b
          >
        </pdk-inset-text>
      }
    </div>
    @if (totalResults() > 0) {
      <div id="crown-scheduling-slots" pdk-padding-left="6" pdk-padding-right="6">
        <crown-scheduling-slots
          #slotsRef
          [selectionMode]="'single'"
          [formConfig]="allocationFormConfig"
          [hearingType]="filterValues?.hearingType"
          [hearingTypes]="hearingTypes()"
          [currentPage]="currentPage()"
          [hearingSlotMinutes]="filterValues?.availableDurationMins"
          [hearingSlots]="hearingSlots()"
          [pageSize]="pageSize()"
          [rotaBusinessTypes]="rotaBusinessTypes()"
          [totalResults]="totalResults()"
          (errors)="errors = $event"
          (hearingSlotAllocations)="hearingSlotAllocationsSubmit.emit($event)"
          (pageChange)="pageChange.emit($event)"
        >
        </crown-scheduling-slots>
      </div>
    }
  `,
  imports: [
    PdkErrorSummaryComponent,
    PdkMarginDirective,
    PdkPaddingDirective,
    CrownSchedulingFiltersComponent,
    PdkInsetTextComponent,
    CrownSchedulingSlotsComponent
  ]
})
export class CrownSchedulingComponent {
  readonly CrownSessionStatus = CrownSessionStatus;

  readonly currentPage = input(0);
  readonly filters = input<Partial<CrownSchedulingFilters>>(undefined);
  readonly hearingTypes = input<HearingType[]>([]);
  readonly hearingSlots = input<HearingSlot[]>([]);
  readonly organisationUnits = input<OrganisationUnit[]>([]);
  readonly pageSize = input(10);
  readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
  readonly totalResults = input(-1);
  readonly filtersSubmit = output<CrownSchedulingFilters>();
  readonly hearingSlotAllocationsSubmit = output<SchedulingSlotAllocationSubmit>();
  readonly hearingSlotsCancel = output<unknown>();
  readonly pageChange = output<number>();
  @ViewChild('slotsRef') slotsRef: CrownSchedulingSlotsComponent;

  constructor(
    @Inject(ALLOCATION_FORM_CONFIGS)
    private allocationFormConfigs: Record<string, AllocationsFormConfig>
  ) {}

  errors: ValidationError[] | null;

  get allocationFormConfig(): AllocationsFormConfig {
    return this.allocationFormConfigs['showHearingTypeAndNotification'];
  }

  handleSubmitFilters(filters: CrownSchedulingFilters) {
    if (this.slotsRef) {
      this.slotsRef.reset();
    }
    this.filtersSubmit.emit(filters);
  }
}
