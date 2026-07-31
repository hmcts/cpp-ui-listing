import { OutputEmitterRef } from '@angular/core';
import {
  CourtRoom,
  HearingType,
  OrganisationUnit,
  RotaBusinessTypeCode
} from '@cpp/reference-data';
import { CourtSession } from '@cpp/scheduling';
import { CaseNote } from '../../allocate-hearing/allocate-hearing.interfaces';
import { ApplicantRespondent, Defendant, JurisdictionType, NonDefaultDay } from '../../core';
import {
  ExtendedJudicialRole,
  Hearing,
  HearingDay,
  Marker,
  PaginatedHearings,
  Pagination
} from '../../core/model/hearing';
import { BaseHearingRowDataVM, BaseHearingSection } from './hearing-table-renderer.interfaces';

export { PaginatedHearings };

export interface CourtCalendarFilters {
  courtType?: JurisdictionType;
  courtCentre: OrganisationUnit;
  businessType?: string;
  courtRoomId?: string;
  startDate: string;
  endDate?: string;
  courtSession?: 'Any' | 'AM' | 'PM' | 'AD';
  pageNumber?: number;
  pageSize?: number;
  hearingType?: HearingType;
  useMaxPageSize?: boolean;
}

export interface AllocateWidgetFilters {
  courtCentre: OrganisationUnit;
  startDate: string;
  businessType?: RotaBusinessTypeCode;
  hearingType?: HearingType;
  courtSession?: 'Any' | 'AM' | 'PM' | 'AD';
}

export interface PaginatedHearingMap {
  courtRoomMapByDate?: Record<string, string[]>;
  paginatedHearings: PaginatedHearings;
}

export interface CourtCalendarState {
  filterOptions: CourtCalendarFilters;
  selectedHearing?: Hearing;
  allocated: PaginatedHearingMap;
  hearingsToReallocate?: Hearing[];
  allocationType?: AllocationType;
  unallocated?: {
    allocateWidgetFilter?: AllocateWidgetFilters;
    hearingMap: PaginatedHearingMap;
  };
  caseNotesMap?: Record<string, CaseNote[]>;
  successAlert?: string;
  failureAlert?: string;
}

export interface CourtRoomCalendarVM extends BaseHearingSection {
  date: string;
  courtRoomName: string;
  courtRoomId: string;
  judiciaryCalendar: CourtRoomJudicialCalendar[];
}

export interface AllocatedWidgetCourtroomCalendarVm extends BaseHearingSection {
  date: string;
  courtRoomName: string;
  courtRoomId: string;
  businessTypeCalendar: CourtRoomBusinessTypeCalendar[];
}

export interface CourtRoomJudicialCalendar {
  judiciary: ExtendedJudicialRole[];
  hearingTimeCalendar: CourtRoomHearingTimeCalendar[];
}

export interface CourtRoomBusinessTypeCalendar {
  businessType: RotaBusinessTypeCode;
  sessions: CourtRoomSessionCalendar[];
}

export interface CourtRoomSessionCalendar {
  slot: {
    courtScheduleId: string;
    session: { startTime: string; endTime: string; type: CourtSession };
  };
  judiciaryCalendar: CourtRoomJudicialCalendar[];
}

export interface CourtRoomHearingTimeCalendar {
  time: string;
  hearings: HearingRowVM[];
}

export interface CourtCalendarVM {
  courtRoomCalendars: CourtRoomCalendarVM[];
  pagination?: Pagination;
  totalHearingsDisplayed?: number;
}

export interface HearingRowVM extends BaseHearingRowDataVM {
  id: string;
  dateTime: string;
  duration: number;
  judiciary: ExtendedJudicialRole[];
  hearingDate: string;
  hearingType: HearingTypeVM;
  defendants: HearingDefendantVM;
  offences: string[];
  publicListNote?: string;
}

export interface HearingTypeVM {
  description: string;
  hasReportingRestriction: boolean;
  markers: Marker[];
}

export interface HearingDefendantVM {
  defendants?: Defendant[];
  applicationParties?: {
    respondents?: ApplicantRespondent[];
    applicant: ApplicantRespondent;
  };
  caseUrn?: string;
  caseId?: string;
  applicationReference?: string;
  applicationId?: string;
  applicationTypeCode?: string;
}

export interface HearingDayVM extends HearingDay {
  position: number;
}

export interface caseReferncesVM {
  caseId?: string;
  caseUrn?: string;
  applicationReference?: string;
  applicationId?: string;
}

export interface RemoveHearingVM {
  id: string;
  courtName: string;
  startDate: string;
  courtRoom: string;
  duration: string;
  hearingType: string;
  hearingLanguage: string;
  videoHearing: 'Yes' | 'No';
  multiDayHearing: {
    isMultiDay: 'Yes' | 'No';
    startDate: string;
    endDate: string;
  };
}

export interface ChangeCourtroomVM {
  time: string;
  hearingType: string;
  cases: caseReferncesVM[];
  upComingHearingDays: HearingDayVM[];
  totalHearingDaysCount: number;
  hasReportingRestriction: boolean;
  courtCentre: string;
  courtRooms: CourtRoom[];
  startDate: string;
  endDate: string;
  ouCode: string;
  jurisdictionType: JurisdictionType;
}

export interface ConfirmCourtRoomChangeEvent {
  confirmed: boolean;
  clearSelection?: boolean;
}
export interface ConfirmCourtRoomChange {
  onConfirmation: OutputEmitterRef<ConfirmCourtRoomChangeEvent>;
}

export interface RemoveHearingPayload {
  hearingId: string;
  reason: string;
}

export interface AllocationHearingsVM {
  allocationHearings: AllocationHearingsSectionVm[];
  pagination?: Pagination;
  allocationType: AllocationType;
}

export interface AllocationHearingsSectionVm extends BaseHearingSection {
  date: string;
  isWeekCommencing?: boolean;
  forMultiReallocate?: boolean;
  allocationCalendar: Pick<CourtRoomJudicialCalendar, 'hearingTimeCalendar'>;
}

export enum AllocationType {
  reallocate = 'REALLOCATE',
  allocate = 'ALLOCATE'
}

export interface AllocateHearingCase {
  caseId: string;
  defendants: {
    defendantId: string;
    offences: { offenceId: string }[];
  }[];
}
export interface HearingAllocationPayload extends Pick<
  Hearing,
  | 'courtRoomId'
  | 'courtCentreId'
  | 'startDate'
  | 'endDate'
  | 'judiciary'
  | 'jurisdictionType'
  | 'nonSittingDays'
  | 'hearingLanguage'
  | 'publicListNote'
  | 'hasVideoLink'
  | 'bookingType'
  | 'priority'
  | 'type'
  | 'specialRequirements'
  | 'sendNotificationToParties'
> {
  courtRoomId: string;
  nonDefaultDays: NonDefaultDay[];
  hearingId: string;
  prosecutionCases?: AllocateHearingCase[];
}

export interface BulkAllocatePayload {
  hearings: HearingAllocationPayload[];
}

export interface ChangeJudiciaryEvent {
  judiciaryIds: string;
  courtRoomId: string;
  searchDate: string;
  courtCentreId: string;
}
