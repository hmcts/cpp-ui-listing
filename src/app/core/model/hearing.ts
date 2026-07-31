import { Defendant } from './';
import { CourtRoom } from './court-centre';
import { CourtApplication } from './court-application';
import { TypeOfListOptions } from '../../unscheduled-listings/unscheduled-listings.interfaces';
import { JudicialMember, JudiciaryTypeGroup } from '@cpp/reference-data';
import { DateRange } from '../../shared/components/date-range/date-range';
import { HearingSlotAllocation, ListingNote } from '@cpp/scheduling';

export interface JudiciaryGroupMapType {
  [key: string]: JudiciaryTypeGroup;
}
export interface JudicialRoleType {
  judiciaryType: JudiciaryTypeGroup;
}

// This interface is a representation of the JudicialRole once it has been
// extended with the judicial member names on the context
export interface ExtendedJudicialRole extends JudicialRole {
  judicialMember?: JudicialMember;
}

export interface JudicialRole {
  judicialId: string;
  judicialRoleType: JudicialRoleType;
  isDeputy?: boolean;
  isBenchChairman?: boolean;
}

export interface Hearing {
  id: string;
  type: HearingType;
  courtApplications?: CourtApplication[];
  courtCentreId: string;
  courtRoomId?: string;
  courtRoomNumber?: number;
  weekCommencingStartDate?: string;
  weekCommencingEndDate?: string;
  weekCommencingDurationInWeeks?: number;
  startDate?: string;
  endDate?: string;
  estimatedMinutes: number;
  allocated: boolean;
  adjournedFromDate?: string;
  jurisdictionType: 'MAGISTRATES' | 'CROWN';
  judiciary: ExtendedJudicialRole[];
  hearingLanguage: 'ENGLISH' | 'WELSH';
  sequence?: number;
  reportingRestrictionReason?: string;
  listedCases: ListedCase[];
  hearingDays: HearingDay[];
  nonDefaultDays?: NonDefaultDay[];
  nonSittingDays: string[];
  prosecutorDatesToAvoid?: string[];
  listingDirections?: string;
  temporaryHearingId?: string;
  vacatedTrialReasonId?: string;
  typeOfList?: TypeOfListOptions;
  publicListNote?: string;
  hasVideoLink?: boolean;
  totalCases?: number;
  startTime?: string;
  bookingType?: string;
  priority?: string;
  specialRequirements?: string[];
  sendNotificationToParties?: boolean;
  isPossibleDisqualification?: boolean;
  courtCentreDetails?: any;
  dateRange?: DateRange;
  duration?: string;
  hearingDayCount?: number;
  hearingDayPosition?: number;
  resulted?: boolean;
}

export interface HearingWithSelectedCourtCentre extends Hearing {
  selectedCourtCentre: {
    id: string;
    courtRoomId: string;
    courtCentreName: string;
    ouCode?: string;
  };
}

export interface AllocatingHearingDetails {
  originHearing: Hearing;
  updatedHearing: Hearing | HearingWithSelectedCourtCentre;
}

export interface AllocatingHearingDetailsWithCourtCentre extends AllocatingHearingDetails {
  updatedHearing: HearingWithSelectedCourtCentre;
}

export enum PanelType {
  ADULT = 'ADULT',
  YOUTH = 'YOUTH'
}

export interface AllocateHearingFilters {
  hearingSlotAllocations?: HearingSlotAllocation[];
  priority?: string;
  bookingType?: string;
  startDate?: string;
  endDate?: string;
  weekCommencingStartDate?: string;
  weekCommencingEndDate?: string;
  weekCommencingDurationInWeeks?: number;
  specialRequirements?: string[];
}

export interface HearingSchedule {
  hearingSlotAllocations: HearingSlotAllocation[];
}

export interface HearingSlotJudiciary {
  judiciaryId: string;
  courtScheduleId: string;
  courtListingProfileId: string;
  judiciaryType: string;
  deputy: boolean;
  benchChairman: boolean;
}

export interface Type {
  id: string;
  description: string;
}

export interface NonDefaultDay {
  startTime: string;
  duration?: number;
  courtScheduleId?: string;
  session?: string;
  oucode?: string;
  courtCentreId?: string;
  courtRoomId?: number;
  roomId?: string;
  virtual?: boolean;
}

export interface SequenceHearing {
  id: string;
  sequenceHearingDays: SequenceDay[];
}

export interface SequenceDay {
  hearingDate: string;
  sequence: number;
}

export interface HearingDay {
  courtRoomId?: string;
  hearingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  sequence: number;
  matchedWithQuery?: boolean;
  courtCentreId?: string;
  courtScheduleId?: string;
}

export interface HearingsGroupedByStartTime {
  [hearingDate: string]: Hearing[];
}

export interface HearingsGroupedByDateAndRoom {
  date: string;
  hearingsGroupedByJudiciaryAndRoom: HearingsGroupedByJudiciaryAndRoom[];
}

export interface HearingsGroupedByJudiciaryAndRoom {
  courtRoom: CourtRoom;
  hearingsGroupedByJudiciary: HearingsGroupedByJudiciary[];
}

export interface HearingsGroupedByJudiciary {
  judiciary: string;
  hearings: Hearing[];
}

export interface ListedCase {
  id: string;
  caseId?: string;
  caseIdentifier: CaseIdentifier;
  defendants: Defendant[];
  markers?: Marker[];
  prosecutor?: Prosecutor;
  restrictFromCourtList?: boolean;
  shadowListed?: boolean;
  isGroupMember?: boolean;
  isGroupMaster?: boolean;
  isCivil?: boolean;
}

export interface Marker {
  id: string;
  markerTypeid: string;
  markerTypeCode: string;
  markerTypeDescription: string;
  restrictFromCourtList?: boolean;
}

export interface Prosecutor {
  prosecutorId: string;
  prosecutorCode: string;
}

export interface CaseIdentifier {
  authorityId: string;
  authorityCode: string;
  caseReference: string;
}

export interface UpdateHearing {
  courtCentreId: string;
  courtRoomId: string;
  type: Type;
  nonSittingDays: string[];
  nonDefaultDays: Array<{ startTime: string }>;
  judiciary: JudicialRole[];
  jurisdictionType: JurisdictionType;
  hearingLanguage: string;
  publicListNote: string;
  hasVideoLink: boolean;
}

export interface HearingType {
  id: string;
  description: string;
}

export interface SelectedFilterOptions {
  allocated?: boolean;
  courtCentreId?: string;
  authorityId?: string;
  hearingTypeId?: string;
  jurisdictionType?: JurisdictionType | 'ALL';
  courtRoomId?: string;
  searchDate?: string;
  listId?: string;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  isWelsh?: boolean;
  isCrownCourt?: boolean;
  weekCommencingStartDate?: string;
  weekCommencingEndDate?: string;
  courtCentre?: string;
  restricted?: boolean;
  oucodeL2Code?: string;
  typeOfList?: string;
  caseUrn?: string;
  possibleDisqualification?: string;
  pageSize?: number;
  pageNumber?: number;
  ouCode?: string;
  useMaxPageSize?: boolean;
  businessType?: string;
  courtSession?: 'Any' | 'AM' | 'PM' | 'AD';
  exactHearingStartDateTime?: string;
}

export interface CourtRestriction {
  hearingId: string;
  caseIds?: string[];
  defendantIds?: string[];
  offenceIds?: string[];
  restrictCourtList: boolean;
}

export interface PublishStatus {
  courtCentreId?: string;
  publishCourtListType?: PublishCourtListType;
  lastUpdated?: string;
  publishStatus?: string;
  failureMessage?: string;
  startDate?: string;
  endDate?: string;
  publishCourtListTypes?: string;
  displayDate?: string;
  publishDate?: string;
  weekCommencing?: boolean;
  sendNotificationToParties?: boolean;
}

export interface SearchAvailableHearingsFormOptions {
  hearingId: string;
  jurisdictionType: JurisdictionType;
  caseUrns?: string[];
  searchCriterias?: SearchCriteriaAvailableHearingsType[];
  returnAllHearings?: boolean;
}

export enum SearchCriteriaAvailableHearingsType {
  CASE_IN_HEARING = 'CASE_IN_HEARING',
  MATCHED_DEFENDANTS = 'MATCHED_DEFENDANTS'
}
export enum PublishCourtListType {
  Firm = 'FIRM',
  Warn = 'WARN',
  Draft = 'DRAFT',
  Final = 'FINAL'
}

export type JurisdictionType = 'MAGISTRATES' | 'CROWN';

export const DEFAULT_PAGINATION_ITEMS_PER_PAGE = 50;
export interface Pagination {
  currentPage?: number;
  pageCount?: number;
  totalNumber: number;
  itemsPerPage?: number;
}

export interface UnallocatedHearings {
  hearings: Hearing[];
  pagination: Pagination;
}

export interface PaginatedHearings {
  hearings: Hearing[];
  pagination: Pagination;
}

export interface PaginatedHearingResponse {
  hearings: Hearing[];
  notes?: ListingNote[];
  results: number;
  pageCount: number;
}
