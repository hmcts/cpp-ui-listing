import { OrganisationUnit } from '@cpp/reference-data';
import { Hearing } from '../../core';
import { HearingRowVM } from './court-calendar.model';
import { InputSignal } from '@angular/core';

// utility types to dynamically create the table config for any given entity using a sectioned schema
export type PickPropertyKeys<T, P extends keyof T> =
  T[P] extends Array<infer SP> ? keyof SP : T[P] extends object ? keyof T[P] : never;
export interface SectionHeaderConfig<
  T extends CourtCalendarGenericRecord,
  K extends keyof T = keyof T
> {
  key?: K; // use if getting section header from Data
  label?: string;
}

export interface RowGroupHeaderConfig<T extends CourtCalendarGenericRecord, P extends keyof T> {
  label?: string;
  rowGroupHeaderPath?: PickPropertyKeys<T, P>;
}

export interface RowGroupDataConfig<
  T extends CourtCalendarGenericRecord,
  P extends keyof T,
  D extends PickPropertyKeys<T, P>
> {
  label?: string;
  rowGroupDataPath?: D;
  rowsDataPath: T[P] extends Array<infer U>
    ? D extends keyof U
      ? PickPropertyKeys<U, D>
      : never
    : T[P] extends object
      ? PickPropertyKeys<T[P], D>
      : never;
}

export interface BaseHearingSection {
  sectionIdentifier: string;
  courtCentre: OrganisationUnit;
}

export interface RowsDataConfig<T extends CourtCalendarGenericRecord> {
  rowsDataPath?: keyof T;
}

export interface RowGroupsConfig<
  T extends CourtCalendarGenericRecord,
  P extends keyof T,
  D extends PickPropertyKeys<T, P>
> {
  rowGroupsPath: P;
  headerConfig?: RowGroupHeaderConfig<T, P>;
  dataConfig?: RowGroupDataConfig<T, P, D>;
}

export interface HearingTableSectionConfig<
  T extends CourtCalendarGenericRecord,
  RowGroupsPath extends keyof T,
  RowGroupDataPath extends PickPropertyKeys<T, RowGroupsPath>
> {
  actionable: boolean;
  rowsAreExpandable?: boolean;
  rowsExpandHeaderDescription?: string;
  headerCellsVisuallyHidden?: boolean;
  hasTableSectionHeader?: boolean;
  sectionHeader?: SectionHeaderConfig<T>;
  rowGroups?: RowGroupsConfig<T, RowGroupsPath, RowGroupDataPath>;
  rows?: RowsDataConfig<T>;
}

export interface TableColumn<T> {
  label: string;
  key?: keyof T;
  maxWidth?: number;
  isDictionaryCell?: boolean;
  columnLabelVisuallyHidden?: boolean;
  renderOnlyForMasterRow?: boolean;
}

export interface BaseHearingRowDataVM {
  id: string;
  isMaster?: boolean;
  instances?: number;
  isChild?: boolean;
  isLastChild?: boolean;
  details?: Hearing;
  rowIdentifier: string; // provide this identifier as unique because there is a possibility we could have multiple hearings with the same id as parent-child
  hearingDate: string;
  sequence: number;
  isDisabled?: boolean;
  checkSplit?: boolean;
}

export type ColumnConfig<BaseHearingRowDataVM> = TableColumn<BaseHearingRowDataVM>[];
export type CourtCalendarGenericRecord = Record<string, any>;

export interface TableContext<
  S extends CourtCalendarGenericRecord = CourtCalendarGenericRecord,
  T extends BaseHearingRowDataVM = BaseHearingRowDataVM,
  k extends keyof T = keyof T
> {
  sectionData?: S;
  sectionCellData?: S[keyof S];
  rowGroupData?: Record<string, T[] | string>;
  rowData?: T;
  cellData?: T[k];
  tableSectionConfig?: HearingTableSectionConfig<S, keyof S, PickPropertyKeys<S, keyof S>>;
  rowGroupsConfig?: RowGroupsConfig<S, keyof S, PickPropertyKeys<S, keyof S>>;
  columnConfig?: ColumnConfig<T>[number];
}

export interface BaseHearingTable<
  T extends CourtCalendarGenericRecord,
  RowGroupsPath extends keyof T,
  RowGroupDataPath extends PickPropertyKeys<T, RowGroupsPath>
> {
  sections?: InputSignal<T[]>;
  rows?: T[];
  sectionConfig?: HearingTableSectionConfig<T, RowGroupsPath, RowGroupDataPath>;
  columnConfig: ColumnConfig<any>;
  getAllMasterHearingRows?: () => HearingRowVM[];
}
