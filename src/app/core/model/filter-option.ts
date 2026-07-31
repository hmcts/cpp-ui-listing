export interface FilterOption {
  label: string;
  value: string;
  selected?: boolean;
}

export interface CreateListFilterOptions {
  courtCentreId?: string;
  courtRoomId?: string;
  startDate?: string;
  endDate?: string;
  isCrownCourt?: boolean;
  weekCommencingStartDate?: string;
  weekCommencingEndDate?: string;
  courtCentre?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CourtroomsFilter {
  courtCentreId: string | null;
  courtRoomId: string | null;
  searchDate: string;
  startTime?: string;
  endTime?: string;
}
