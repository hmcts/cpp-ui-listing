import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  input,
  output,
  ViewChild
} from '@angular/core';
import {
  PdkErrorSummaryComponent,
  PdkInsetTextComponent,
  PdkMarginDirective,
  PdkPaddingDirective,
  ValidationError
} from '@cpp/pdk';
import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import {
  ALLOCATION_FORM_CONFIGS,
  AllocationsFormConfig,
  HearingSlot,
  MagistratesSchedulingFilters,
  MagistratesSchedulingFiltersComponent,
  MagistratesSchedulingSlotsComponent,
  SchedulingSlotAllocationSubmit
} from '@cpp/scheduling';

@Component({
  selector: 'magistrates-scheduling',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let filterValues = filters();
    @if (errors) {
      <pdk-error-summary [errors]="errors"></pdk-error-summary>
    }
    <div pdk-margin-bottom="6" pdk-padding-left="6" pdk-padding-right="6">
      <magistrates-scheduling-filters
        [organisationUnits]="organisationUnits()"
        [rotaBusinessTypes]="rotaBusinessTypes()"
        [defaultValues]="filterValues"
        (filtersSubmit)="handleSubmitFilters($event)"
        (errors)="errors = $event"
      >
      </magistrates-scheduling-filters>
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
      <div id="magistrates-scheduling-slots" pdk-padding-left="6" pdk-padding-right="6">
        <magistrates-scheduling-slots
          #slotsRef
          [selectionMode]="filterValues?.isMultiday ? 'multi' : 'single'"
          [formConfig]="allocationFormConfig"
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
        </magistrates-scheduling-slots>
      </div>
    }
  `,
  imports: [
    PdkErrorSummaryComponent,
    PdkMarginDirective,
    PdkPaddingDirective,
    MagistratesSchedulingFiltersComponent,
    PdkInsetTextComponent,
    MagistratesSchedulingSlotsComponent
  ]
})
export class MagistratesSchedulingComponent {
  readonly currentPage = input(0);
  readonly filters = input<Partial<MagistratesSchedulingFilters>>(undefined);
  readonly hearingSlots = input<HearingSlot[]>([]);
  readonly organisationUnits = input<OrganisationUnit[]>([]);
  readonly pageSize = input(10);
  readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
  readonly totalResults = input(-1);

  readonly filtersSubmit = output<MagistratesSchedulingFilters>();
  readonly hearingSlotAllocationsSubmit = output<SchedulingSlotAllocationSubmit>();
  readonly hearingSlotsCancel = output<unknown>();
  readonly pageChange = output<number>();
  @ViewChild('slotsRef') slotsRef: MagistratesSchedulingSlotsComponent;

  constructor(
    @Inject(ALLOCATION_FORM_CONFIGS)
    private allocationFormConfigs: Record<string, AllocationsFormConfig>
  ) {}

  errors: ValidationError[] | null;

  get allocationFormConfig(): AllocationsFormConfig {
    return this.allocationFormConfigs['showNotification'];
  }

  handleSubmitFilters(filters: MagistratesSchedulingFilters) {
    if (this.slotsRef) {
      this.slotsRef.reset();
    }
    this.filtersSubmit.emit(filters);
  }
}
