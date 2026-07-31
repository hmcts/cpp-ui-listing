import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Inject,
  ViewChild,
  input,
  output
} from '@angular/core';
import { CPPDate } from '../../core/util';
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
  HearingSlot,
  HearingSlotAllocation,
  SchedulingFilters,
  SchedulingSlotsComponent,
  SchedulingFiltersComponent
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
      <scheduling-filters
        [organisationUnits]="organisationUnits()"
        [rotaBusinessTypes]="rotaBusinessTypes()"
        [defaultValues]="filterValues"
        [minimumDate]="minimumDate()"
        (filtersSubmit)="handleSubmitFilters($event)"
        (errors)="errors = $event"
      >
      </scheduling-filters>
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
        <scheduling-slots
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
        </scheduling-slots>
      </div>
    }
  `,
  imports: [
    PdkErrorSummaryComponent,
    PdkMarginDirective,
    PdkPaddingDirective,
    SchedulingFiltersComponent,
    PdkInsetTextComponent,
    SchedulingSlotsComponent
  ]
})
export class MagistratesSchedulingComponent {
  readonly currentPage = input(0);
  readonly filters = input<Partial<SchedulingFilters>>(undefined);
  readonly hearingSlots = input<HearingSlot[]>([]);
  readonly organisationUnits = input<OrganisationUnit[]>([]);
  readonly pageSize = input(10);
  readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
  readonly totalResults = input(-1);

  private readonly dateUtil = inject(CPPDate);

  readonly minimumDate = computed(() => this.dateUtil.format(this.dateUtil.getCurrentDate()));
  readonly filtersSubmit = output<SchedulingFilters>();
  readonly hearingSlotAllocationsSubmit = output<{
    hearingSlotAllocations: HearingSlotAllocation[];
    sendNotificationToParties?: boolean;
    hearingType?: HearingType;
  }>();
  readonly hearingSlotsCancel = output<unknown>();
  readonly pageChange = output<number>();
  @ViewChild('slotsRef') slotsRef: SchedulingSlotsComponent;

  constructor(
    @Inject(ALLOCATION_FORM_CONFIGS)
    private allocationFormConfigs: Record<string, AllocationsFormConfig>
  ) {}

  errors: ValidationError[] | null;

  get allocationFormConfig(): AllocationsFormConfig {
    return this.allocationFormConfigs['showNotification'];
  }

  handleSubmitFilters(filters: SchedulingFilters) {
    if (this.slotsRef) {
      this.slotsRef.reset();
    }
    this.filtersSubmit.emit(filters);
  }
}
