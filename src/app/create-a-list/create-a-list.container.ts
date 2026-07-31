import { Component, computed, ElementRef, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { cloneDeep, groupBy, sortBy, uniqBy } from 'lodash-es';
import baseMoment from 'moment';
import { extendMoment } from 'moment-range';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  AppConfigService,
  EXPECTED_LISTING_USER_PERMISSIONS,
  ListingUserPermissions
} from '../config';
import {
  AppState,
  CourtApplication,
  CourtCentre,
  CourtRestrictionAction,
  CreateListFilterOptions,
  getCourtCentres,
  getIsHmctsUser,
  getPagedCourtList,
  getPublishCourtListStatuses,
  GetPublishListStatusAction,
  getReferenceDataHearingTypes,
  getSelectedRestrictedHearing,
  getUserHasCpsAccessOnly,
  getWeekCommencingHearings,
  Hearing,
  HearingDay,
  HearingsGroupedByDateAndRoom,
  HearingsGroupedByJudiciary,
  HearingsGroupedByJudiciaryAndRoom,
  JurisdictionType,
  SearchAllocatedHearingsByDateRangeAction,
  SequenceHearing,
  SequenceHearingAction
} from '../core';
import * as HearingActions from '../core/actions/hearing';
import { CourtRoom, ExtendedJudicialRole, ListedCase } from '../core/model/';
import { CourtRestriction } from '../core/model/court-restriction';
import { Breadcrumb } from '../core/model/shared/breadcrumb';
import {
  ValidationError,
  PdkErrorSummaryComponent,
  PdkMarginDirective,
  PdkBreadcrumbListComponent,
  PdkBreadcrumbListItemDirective,
  PdkBreadcrumbDirective,
  PdkAlertComponent,
  PdkPaddingDirective,
  PdkTypographyDirective,
  PdkGridComponent,
  PdkGridDirective,
  PdkFillColorDirective,
  PdkBorderColorDirective,
  PdkTextColorDirective,
  PdkWarningTextComponent,
  PdkPaginationComponent,
  PdkVisuallyHiddenDirective
} from '@cpp/pdk';
import {
  DEFAULT_PAGINATION_ITEMS_PER_PAGE,
  Pagination,
  PublishStatus
} from '../core/model/hearing';
import { PublicHoliday, HearingType, getPublicHolidays } from '@cpp/reference-data';
import { getUserHasPermission } from '@cpp/users-groups';
import { CPPDate, getCPPDate } from '../core/util';
import { AsyncPipe, DatePipe } from '@angular/common';
import { SubMenuComponent } from '../shared/components/sub-menu/sub-menu.component';
import { RouterLink } from '@angular/router';
import { CreateListFilterComponent } from './create-list-filter/create-list-filter.component';
import { SequenceHearingsComponent } from './sequence-hearings/sequence-hearings.component';
import { DownloadListComponent } from './download-list/download-list.component';
import { MagsCourtListPublishSignalStore } from './signal-store/mags-court-list-publish.signalstore';
import { CourtListType } from './models/mags-publish-list.dto';
import { MagsPublishStatusesComponent } from './mags-publish-statuses/mags-publish-statuses.component';

// we cast as any because there is a problem with Es6 moment range
// see https://github.com/rotaready/moment-range/issues/263 for more details
const moment = extendMoment(baseMoment as any);

@Component({
  selector: 'create-a-list',
  templateUrl: './create-a-list.html',
  styleUrls: ['./create-a-list.container.scss'],
  imports: [
    PdkErrorSummaryComponent,
    PdkMarginDirective,
    SubMenuComponent,
    PdkBreadcrumbListComponent,
    PdkBreadcrumbListItemDirective,
    PdkBreadcrumbDirective,
    RouterLink,
    PdkAlertComponent,
    PdkPaddingDirective,
    PdkTypographyDirective,
    CreateListFilterComponent,
    PdkGridComponent,
    PdkGridDirective,
    PdkFillColorDirective,
    PdkBorderColorDirective,
    PdkTextColorDirective,
    SequenceHearingsComponent,
    PdkWarningTextComponent,
    PdkPaginationComponent,
    PdkVisuallyHiddenDirective,
    DownloadListComponent,
    AsyncPipe,
    DatePipe,
    MagsPublishStatusesComponent
  ],
  providers: [MagsCourtListPublishSignalStore]
})
export class CreateAListContainer implements OnInit, OnDestroy {
  errors: ValidationError[];
  selectedCourtCentre: CourtCentre;
  hasCpsAccessOnly = false;
  hasReorderPermission$: Observable<boolean>;
  hasRestrictDetailsPermission$: Observable<boolean>;

  isSubmitted: boolean;
  courtCentres: CourtCentre[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  hearingTypes$: Observable<HearingType[]>;
  selectedHearings: Hearing[];
  hearingsByDateAndRoom: HearingsGroupedByDateAndRoom[] = [];
  weekHearingsByDateAndRoom: HearingsGroupedByDateAndRoom[] = [];
  selectedOptions: CreateListFilterOptions;
  restrictedCourtHearingSelected$: Observable<Hearing>;
  restrictionsExist: boolean;
  crownCourtSelected: boolean;
  weekCommencingSelected = false;
  weekCommencingRangeText: string;
  courtCentreDetails: string;
  searchRangeText: string;
  publishCourtListsStatuses$: Observable<PublishStatus[]>;
  publishCourtListMessage: string;
  showSubmenu = true;
  NO_COURTROOM = 'NONE';
  PUBLISH_LIST_TYPE_DRAFT = 'DRAFT';
  FORMAT_YYYY_MM_DD = 'YYYY-MM-DD';
  JURISDICTION_CROWN = 'CROWN';

  publicHolidays$: Observable<PublicHoliday[]>;
  pagingInfo: Pagination;
  isHmctsUser$: Observable<boolean>;
  readonly magsCourtListPublishStore = inject(MagsCourtListPublishSignalStore);
  readonly magsPublishStatusesWithAlert = computed(() =>
    (this.magsCourtListPublishStore.statuses() ?? []).filter((status) => !!status.alert)
  );

  get crownSelected() {
    return this.crownCourtSelected;
  }

  private readonly cppDate: CPPDate;

  constructor(
    private store: Store<AppState>,
    private appConfig: AppConfigService,
    private elementRef: ElementRef<HTMLElement>,
    @Inject(EXPECTED_LISTING_USER_PERMISSIONS) public expectedPermissions: ListingUserPermissions
  ) {
    this.store
      .select(getUserHasCpsAccessOnly)
      .pipe(takeUntil(this.destroy$))
      .subscribe((hasCpsAccessOnly) => (this.hasCpsAccessOnly = hasCpsAccessOnly));

    this.cppDate = getCPPDate();
  }

  ngOnInit() {
    this.hearingTypes$ = this.store.select(getReferenceDataHearingTypes);
    this.publicHolidays$ = this.store.select(getPublicHolidays);
    this.store
      .select(getCourtCentres)
      .pipe(takeUntil(this.destroy$))
      .subscribe((courtCentres) => {
        this.courtCentres = courtCentres;
      });
    // Logic for week commencing crown
    this.store
      .select(getWeekCommencingHearings)
      .pipe(takeUntil(this.destroy$))
      .subscribe((pagedHearing) => {
        if (
          pagedHearing &&
          this.selectedOptions &&
          this.selectedOptions.startDate !== this.selectedOptions.endDate &&
          this.selectedOptions.isCrownCourt
        ) {
          const { hearings, pagination } = pagedHearing;
          this.selectedHearings = hearings;

          this.pagingInfo = {
            ...pagination,
            itemsPerPage: DEFAULT_PAGINATION_ITEMS_PER_PAGE
          };

          this.hearingsByDateAndRoom =
            hearings.length && this.selectedOptions
              ? this.getWeekCommencingHearingsGroupedByDateAndRoom(hearings, true)
              : [];
          this.weekHearingsByDateAndRoom =
            hearings.length && this.selectedOptions
              ? this.getWeekCommencingHearingsGroupedByDateAndRoom(hearings)
              : [];
          this.restrictionsExist =
            this.checkListForRestrictions(this.hearingsByDateAndRoom) ||
            this.checkListForRestrictions(this.weekHearingsByDateAndRoom);
        }
      });
    // Logic for Fixed Date search or weekcommencing for non crown
    this.store
      .select(getPagedCourtList)
      .pipe(takeUntil(this.destroy$))
      .subscribe((pagedCourtList) => {
        if (
          (pagedCourtList &&
            this.selectedOptions &&
            this.selectedOptions.startDate === this.selectedOptions.endDate) ||
          (this.weekCommencingSelected && !this.crownCourtSelected)
        ) {
          const { hearings, pagination } = pagedCourtList;
          // logic for fixed date
          this.pagingInfo = {
            ...pagination,
            itemsPerPage: DEFAULT_PAGINATION_ITEMS_PER_PAGE
          };

          this.selectedHearings = hearings;
          this.hearingsByDateAndRoom =
            hearings.length && this.selectedOptions
              ? this.getHearingsGroupedByDateAndRoom(hearings)
              : [];
          this.restrictionsExist = this.checkListForRestrictions(this.hearingsByDateAndRoom);
        }
      });

    this.hasReorderPermission$ = this.store.select(
      getUserHasPermission([this.expectedPermissions.viewReorder])
    );
    this.hasRestrictDetailsPermission$ = this.store.select(
      getUserHasPermission([this.expectedPermissions.viewRestrictDetails])
    );

    this.restrictedCourtHearingSelected$ = this.store.select(getSelectedRestrictedHearing);
    this.publishCourtListsStatuses$ = this.store.select(getPublishCourtListStatuses);
    this.isHmctsUser$ = this.store.select(getIsHmctsUser);
  }

  get breadcrumbs(): Breadcrumb[] {
    return [{ title: 'Home', href: this.appConfig.getBaseUrl() }, { title: this.pageTitle }];
  }

  get pageTitle(): string {
    return this.hasCpsAccessOnly
      ? `Download Magistrates' hearing lists`
      : 'Publish and download hearing lists';
  }

  showValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }

  onSelectCourtCentre(event?: { value: string; type?: string }) {
    if (event) {
      this.selectedCourtCentre = this.courtCentres.find(
        (courtCentre) => courtCentre.id === event.value
      );
    } else {
      this.selectedCourtCentre = undefined;
    }
  }

  formErrors(errors) {
    this.errors = errors;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  filterSubmit(options: CreateListFilterOptions, resetCurrentPage = true) {
    this.publishCourtListMessage = null;
    options.pageNumber = resetCurrentPage ? 1 : options.pageNumber;
    options.pageSize = DEFAULT_PAGINATION_ITEMS_PER_PAGE;
    this.selectedOptions = options;

    this.isSubmitted = true;
    this.crownCourtSelected = options.isCrownCourt;
    this.weekCommencingSelected = this.selectedOptions.startDate !== this.selectedOptions.endDate;
    this.magsCourtListPublishStore.resetStore();
    if (this.selectedOptions.isCrownCourt) {
      const payload: PublishStatus = {
        publishCourtListTypes: this.PUBLISH_LIST_TYPE_DRAFT,
        courtCentreId: this.selectedOptions.courtCentreId,
        weekCommencing: this.weekCommencingSelected,
        publishDate: this.selectedOptions.startDate
      };
      this.store.dispatch(new GetPublishListStatusAction(payload));
    }
    if (!this.selectedOptions.isCrownCourt && !this.selectedOptions.courtRoomId) {
      this.magsCourtListPublishStore.retrieveCourtListPublishStatus({
        courtCentreId: this.selectedOptions.courtCentreId,
        publishDate: this.selectedOptions.startDate
      });
    }
    if (this.weekCommencingSelected) {
      const startRange = moment(this.selectedOptions.startDate, this.FORMAT_YYYY_MM_DD).format(
        'LL'
      );
      const nextFriday = this.cppDate.getNextDayOfWeek(this.selectedOptions.startDate, 5);

      const endRange = moment(nextFriday).format('LL');

      const startRangeMonth = moment(this.selectedOptions.startDate, this.FORMAT_YYYY_MM_DD).format(
        'MMMM'
      );
      const startRangeDay = moment(this.selectedOptions.startDate, this.FORMAT_YYYY_MM_DD).format(
        'D'
      );
      this.searchRangeText = `Week commencing ${startRange}`;
      this.weekCommencingRangeText = `${startRangeDay} ${startRangeMonth}  - ${endRange}`;
      this.courtCentreDetails = options.courtCentre;
    }
    if (this.selectedOptions.isCrownCourt && this.weekCommencingSelected) {
      const weekCommencingStartDate = options.startDate;
      const weekCommencingEndDate = options.endDate;
      const updatedOptions = {
        ...options,
        startDate: null,
        endDate: null,
        weekCommencingStartDate,
        weekCommencingEndDate,
        jurisdictionType: this.JURISDICTION_CROWN as JurisdictionType
      };
      this.store.dispatch(
        new HearingActions.WeekCommencingHearingSearchAction({ options: updatedOptions })
      );
    } else {
      this.store.dispatch(new SearchAllocatedHearingsByDateRangeAction({ options: options }));
    }
  }

  pageChanged(pageNumber: number): void {
    this.filterSubmit({ ...this.selectedOptions, pageNumber }, false);
    this.elementRef.nativeElement.scrollIntoView({ block: 'start' });
  }

  convertJudiciaryStringToJson(json: string): ExtendedJudicialRole {
    return JSON.parse(json);
  }

  getHearingsGroupedByDateAndRoom(hearings: Hearing[]): HearingsGroupedByDateAndRoom[] {
    const range = moment().range(
      moment(this.selectedOptions.startDate),
      moment(this.selectedOptions.endDate)
    );
    const rangeByDay = Array.from(range.by('day'));

    return rangeByDay
      .map((d) => {
        return {
          date: d.format(this.FORMAT_YYYY_MM_DD),
          hearingsGroupedByJudiciaryAndRoom: this.getHearingsGroupedByJudiciaryAndRoom(
            hearings.filter((h) =>
              h.hearingDays.some((hd) => hd.hearingDate === d.format(this.FORMAT_YYYY_MM_DD))
            ),
            rangeByDay
          )
        };
      })
      .filter((h) => h.hearingsGroupedByJudiciaryAndRoom.length > 0);
  }

  getWeekCommencingHearingsGroupedByDateAndRoom(
    hearings: Hearing[],
    fixed = false
  ): HearingsGroupedByDateAndRoom[] {
    if (fixed) {
      const range = moment().range(
        moment(this.selectedOptions.startDate),
        moment(this.selectedOptions.endDate)
      );
      return Array.from(range.by('day'))
        .map((d) => {
          return {
            date: d.format(this.FORMAT_YYYY_MM_DD),
            hearingsGroupedByJudiciaryAndRoom:
              this.getWeekCommencingHearingsGroupedByJudiciaryAndRoom(
                hearings.filter((h) =>
                  h.hearingDays.some((hd) => hd.hearingDate === d.format(this.FORMAT_YYYY_MM_DD))
                ),
                true,
                d.format(this.FORMAT_YYYY_MM_DD)
              )
          };
        })
        .filter((h) => h.hearingsGroupedByJudiciaryAndRoom.length > 0);
    } else {
      return [
        {
          // date is arbitrary (use current date) as we squash all in to one group for week commencing
          date: moment().format(this.FORMAT_YYYY_MM_DD),
          hearingsGroupedByJudiciaryAndRoom:
            this.getWeekCommencingHearingsGroupedByJudiciaryAndRoom(hearings, fixed)
        }
      ].filter((h) => h.hearingsGroupedByJudiciaryAndRoom.length > 0);
    }
  }

  getWeekCommencingHearingsGroupedByJudiciaryAndRoom(
    hearings: Hearing[],
    fixed = false,
    targetDate?: string
  ): HearingsGroupedByJudiciaryAndRoom[] {
    const filteredHearings = hearings.filter((h) => {
      const hasValidCourtroom = this.selectedCourtCentre.courtRooms.some(
        (cRoom) => cRoom.id === h.courtRoomId || h.courtRoomId === this.NO_COURTROOM
      );

      if (fixed) {
        // Fixed date: include hearings with valid courtroom (ignore weekCommencingStartDate)
        return hasValidCourtroom && !h.weekCommencingStartDate;
      } else {
        // Week commencing: include hearings with valid courtroom AND weekCommencingStartDate
        return hasValidCourtroom && h.weekCommencingStartDate !== undefined;
      }
    });

    const getHearingCourtroomID = (h: Hearing) => {
      if (h.hearingDays?.length > 0 && targetDate) {
        const matchingDay = h.hearingDays.find((hd) => hd.hearingDate === targetDate);
        if (matchingDay) {
          return matchingDay.courtRoomId;
        }
      }
      return h.courtRoomId;
    };

    const courtrooms = filteredHearings.reduce((acc, h) => {
      const roomID = getHearingCourtroomID(h);

      if (roomID && roomID !== this.NO_COURTROOM) {
        const courtRoom = this.selectedCourtCentre.courtRooms.find((r) => r.id === roomID);
        if (courtRoom) {
          acc.push(courtRoom);
        }
      } else if (roomID === this.NO_COURTROOM) {
        acc.push({
          id: this.NO_COURTROOM,
          name: this.NO_COURTROOM
        });
      }

      return uniqBy(acc, 'id');
    }, [] as CourtRoom[]);

    return sortBy(courtrooms, 'name').map((room) => {
      const hearingsInRoom = filteredHearings.filter((h) => getHearingCourtroomID(h) === room.id);

      return {
        courtRoom: room,
        hearingsGroupedByJudiciary: this.getJudiciaryHearings(hearingsInRoom)
      };
    });
  }

  getHearingsGroupedByJudiciaryAndRoom(
    hearings: Hearing[],
    range: baseMoment.Moment[]
  ): HearingsGroupedByJudiciaryAndRoom[] {
    const hearingHasDaysInCourtRoom = (
      hearingDays: HearingDay[],
      selectedCourtRoomId: string
    ): boolean => {
      return hearingDays.some(
        (day) =>
          day.courtRoomId === selectedCourtRoomId &&
          range.some((rangeDay) => rangeDay.format(this.FORMAT_YYYY_MM_DD) === day.hearingDate)
      );
    };

    const filteredHearings = hearings.filter(({ hearingDays, weekCommencingStartDate }) =>
      this.selectedCourtCentre.courtRooms.find(
        ({ id }) =>
          hearingHasDaysInCourtRoom(hearingDays, id) &&
          (weekCommencingStartDate === undefined || weekCommencingStartDate === null)
      )
    );

    return Array.from(
      new Set(
        filteredHearings
          .map(
            ({ hearingDays }) =>
              this.selectedCourtCentre.courtRooms.find(({ id }) =>
                hearingHasDaysInCourtRoom(hearingDays, id)
              ).name
          )
          .sort((a, b) => (a < b ? -1 : 1))
      )
    ).map((roomName) => {
      const room = this.selectedCourtCentre.courtRooms.find(({ name }) => name === roomName);
      return {
        courtRoom: room,
        hearingsGroupedByJudiciary: this.getJudiciaryHearings(
          hearings.filter(({ hearingDays }) => hearingHasDaysInCourtRoom(hearingDays, room.id))
        )
      };
    });
  }

  getJudiciaryHearings(allocatedHearings: Hearing[]): HearingsGroupedByJudiciary[] {
    return Object.entries(
      groupBy(allocatedHearings, (h) => JSON.stringify(this.sortJudiciary(h.judiciary)))
    )
      .map((item) => ({
        judiciary: item[0],
        hearings: item[1]
      }))
      .sort((a, b) => (a.judiciary.length || 0) - (b.judiciary.length || 0));
  }

  sortJudiciary(judiciaries: ExtendedJudicialRole[]): ExtendedJudicialRole[] {
    const judiciaryArray = cloneDeep(judiciaries);
    // chairmans have preference, after that we just want to have always the same order
    return judiciaryArray.sort((a, b) => {
      if (a.isBenchChairman && !b.isBenchChairman) {
        return -1;
      } else if (!a.isBenchChairman && b.isBenchChairman) {
        return 1;
      }

      return a.judicialId > b.judicialId ? 1 : -1 || 0;
    });
  }

  saveSequence(hearings: SequenceHearing[]) {
    this.store.dispatch(new SequenceHearingAction({ hearings }));
  }

  updateCourtRestrictions(courtRestriction: CourtRestriction) {
    let options;
    const jurisdictionType = this.crownCourtSelected ? this.JURISDICTION_CROWN : null;
    if (this.weekCommencingSelected && this.crownCourtSelected) {
      const weekCommencingStartDate = this.selectedOptions.startDate;
      const weekCommencingEndDate = this.selectedOptions.endDate;
      options = {
        ...this.selectedOptions,
        jurisdictionType,
        startDate: null,
        endDate: null,
        weekCommencingStartDate,
        weekCommencingEndDate
      };
    } else {
      options = { ...this.selectedOptions, jurisdictionType };
    }
    this.store.dispatch(new CourtRestrictionAction({ courtRestriction, options }));
  }

  checkListForRestrictions(hearingsByRoom: HearingsGroupedByDateAndRoom[]) {
    let restrictionsExist = false;
    if (hearingsByRoom && hearingsByRoom.length > 0) {
      hearingsByRoom.forEach((hearingByRoom) => {
        return hearingByRoom.hearingsGroupedByJudiciaryAndRoom.map((hearingByJudiciaryAndRoom) => {
          return hearingByJudiciaryAndRoom.hearingsGroupedByJudiciary.map((hearingByJudiciary) => {
            return hearingByJudiciary.hearings.map((hearing) => {
              if (hearing.listedCases) {
                return hearing.listedCases.map((listedCase) => {
                  if (this.checkCaseForRestrictions(listedCase)) {
                    restrictionsExist = true;
                  }
                });
              }
              if (hearing.courtApplications) {
                return hearing.courtApplications.map((application) => {
                  if (this.checkApplicationForRestrictions(application)) {
                    restrictionsExist = true;
                  }
                });
              }
            });
          });
        });
      });
    }
    return restrictionsExist;
  }

  checkCaseForRestrictions(listedCase: ListedCase) {
    let restrictionExists = false;
    if (listedCase.shadowListed) {
      return true;
    }
    if (listedCase.defendants) {
      listedCase.defendants.forEach((caseDefendant) => {
        if (caseDefendant.offences) {
          caseDefendant.offences.forEach((defendantOffence) => {
            if (defendantOffence.shadowListed) {
              restrictionExists = true;
              return;
            }
          });
        }
      });
    }
    return restrictionExists;
  }
  checkApplicationForRestrictions(courtApplication: CourtApplication) {
    let restrictionExists = false;
    if (courtApplication.restrictFromCourtList) {
      return true;
    }
    if (courtApplication.applicant && courtApplication.applicant.restrictFromCourtList) {
      return true;
    }
    if (courtApplication.restrictCourtApplicationType) {
      return true;
    }
    if (courtApplication.respondents) {
      courtApplication.respondents.forEach((respondent) => {
        if (respondent.restrictFromCourtList) {
          restrictionExists = true;
          return;
        }
      });
    }
    return restrictionExists;
  }

  onListPublished(publishStatus: PublishStatus) {
    this.publishCourtListMessage = `${publishStatus.publishCourtListType} hearing list published: ${this.selectedOptions.courtCentre}, All courtrooms, ${publishStatus.displayDate}`;
  }

  publishMagsCourtList(courtListType: CourtListType) {
    this.magsCourtListPublishStore.publishCourtList({
      courtCentreId: this.selectedOptions.courtCentreId,
      startDate: this.selectedOptions.startDate,
      endDate: this.selectedOptions.endDate,
      courtListType
    });
  }
  downloadMagsPublishedList(downloadRequest: { fileId: string; listType: CourtListType }): void {
    this.magsCourtListPublishStore.downloadMagsPublishedListPdf(downloadRequest);
  }
}
