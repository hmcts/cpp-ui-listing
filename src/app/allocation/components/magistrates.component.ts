import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DoCheck,
  inject,
  Inject,
  ViewChild,
  input,
  output,
  signal
} from '@angular/core';
import {
  checkPastDate,
  CPPDate,
  ENFORCEMENT_BUSINESS_TYPE_CODE,
  getEarliestEnforcementDate,
  PAST_DATE_MESSAGES,
  PastDateCheck
} from '../../core/util';
import {
  ModalService,
  provideModalServices,
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
import {
  PastDateWarningModalComponent,
  PastDateWarningModalData
} from './past-date-warning-modal.component';

@Component({
  selector: 'magistrates-scheduling',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideModalServices()],
  template: `
    @let filterValues = filters();
    @if (errors) {
      <pdk-error-summary [errors]="errors"></pdk-error-summary>
    }
    <div pdk-margin-bottom="6" pdk-padding-left="6" pdk-padding-right="6">
      <scheduling-filters
        #filtersRef
        [organisationUnits]="organisationUnits()"
        [rotaBusinessTypes]="rotaBusinessTypes()"
        [defaultValues]="filterValues"
        [minimumDate]="minimumDate()"
        [startDateErrorMessages]="startDateErrorMessages()"
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
export class MagistratesSchedulingComponent implements DoCheck {
  readonly currentPage = input(0);
  readonly filters = input<Partial<SchedulingFilters>>(undefined);
  readonly hearingSlots = input<HearingSlot[]>([]);
  readonly organisationUnits = input<OrganisationUnit[]>([]);
  readonly pageSize = input(10);
  readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
  readonly totalResults = input(-1);
  readonly isEnforcementCase = input(false);

  private readonly dateUtil = inject(CPPDate);
  private readonly modalService = inject(ModalService);

  private readonly today = computed(() => this.dateUtil.format(this.dateUtil.getCurrentDate()));
  readonly selectedBusinessType = signal<string | undefined>(undefined);
  private readonly pastDatesAllowed = computed(
    () => this.isEnforcementCase() && this.selectedBusinessType() === ENFORCEMENT_BUSINESS_TYPE_CODE
  );
  readonly minimumDate = computed(() =>
    this.pastDatesAllowed() ? getEarliestEnforcementDate(this.today()) : this.today()
  );
  readonly startDateErrorMessages = computed(() => [
    { rule: 'required', message: 'Enter a start date' },
    { rule: 'minDate', message: PAST_DATE_MESSAGES[this.minimumDateCheck()] }
  ]);
  private readonly minimumDateCheck = computed(() => {
    if (!this.isEnforcementCase()) {
      return PastDateCheck.NotEnforcementCase;
    }
    return this.pastDatesAllowed()
      ? PastDateCheck.TooFarInPast
      : PastDateCheck.NotEnforcementBusinessType;
  });
  readonly filtersSubmit = output<SchedulingFilters>();
  readonly hearingSlotAllocationsSubmit = output<{
    hearingSlotAllocations: HearingSlotAllocation[];
    sendNotificationToParties?: boolean;
    hearingType?: HearingType;
  }>();
  readonly hearingSlotsCancel = output<unknown>();
  readonly pageChange = output<number>();
  @ViewChild('slotsRef') slotsRef: SchedulingSlotsComponent;
  @ViewChild('filtersRef') filtersRef: SchedulingFiltersComponent;

  constructor(
    @Inject(ALLOCATION_FORM_CONFIGS)
    private allocationFormConfigs: Record<string, AllocationsFormConfig>
  ) {}

  errors: ValidationError[] | null;
  ngDoCheck() {
    const businessType = this.filtersRef
      ? this.filtersRef.formModel?.businessType
      : this.filters()?.businessType;
    if (businessType !== this.selectedBusinessType()) {
      this.selectedBusinessType.set(businessType);
    }
  }

  get allocationFormConfig(): AllocationsFormConfig {
    return this.allocationFormConfigs['showNotification'];
  }

  handleSubmitFilters(filters: SchedulingFilters) {
    const pastDateCheck = checkPastDate({
      isEnforcementCase: this.isEnforcementCase(),
      businessType: filters.businessType,
      startDate: filters.sessionStartDate,
      today: this.today()
    });

    if (pastDateCheck === PastDateCheck.Allowed) {
      this.submitFilters(filters);
    } else if (pastDateCheck === PastDateCheck.Warning) {
      this.confirmPastDate(filters);
    } else {
      this.errors = [{ id: 'sessionStartDate', message: PAST_DATE_MESSAGES[pastDateCheck] }];
    }
  }

  private confirmPastDate(filters: SchedulingFilters) {
    const modalRef = this.modalService.open<PastDateWarningModalData>(
      PastDateWarningModalComponent,
      {
        data: {
          continue: () => {
            modalRef.dispose();
            this.submitFilters(filters);
          },
          cancel: () => modalRef.dispose()
        },
        disposeOnNavigation: true,
        disposeOnBackDropClick: false
      }
    );
  }

  private submitFilters(filters: SchedulingFilters) {
    if (this.slotsRef) {
      this.slotsRef.reset();
    }
    this.filtersSubmit.emit(filters);
  }
}
