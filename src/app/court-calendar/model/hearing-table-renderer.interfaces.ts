import { OrganisationUnit } from '@cpp/reference-data';
import { Hearing } from '../../core';
import { HearingRowVM } from './court-calendar.model';
import { InputSignal } from '@angular/core';
import { PdkColor } from '@cpp/pdk';

// ─── Group levels config ───────────────────────────────────────────────────────

export interface HearingsGroupLevel {
  path: string;
  hasHeader: boolean;
  dataPath?: string;
  label?: string;
  bgColor?: PdkColor;
}

export interface HearingsGroupLevelsConfig {
  levels: HearingsGroupLevel[];
  rowsPath: string;
}

// ─── Section config ────────────────────────────────────────────────────────────

export interface HearingsTableSectionConfig {
  actionable: boolean;
  rowsAreExpandable?: boolean;
  rowsExpandHeaderDescription?: string;
  headerCellsVisuallyHidden?: boolean;
  hasTableSectionHeader?: boolean;
  sectionHeader?: { key?: string; label?: string };
  groupLevels?: HearingsGroupLevelsConfig;
}

// ─── Template context ──────────────────────────────────────────────────────────

export interface HearingsTableContext<
  S = Record<string, unknown>,
  T extends BaseHearingRowDataVM = BaseHearingRowDataVM
> {
  sectionData?: S;
  levelData?: Record<string, unknown>;
  rowGroupData?: Record<string, unknown>;
  rowData?: T;
  cellData?: unknown;
  columnConfig?: HearingsTableColumn<T>;
}

// ─── Column config ─────────────────────────────────────────────────────────────

export interface HearingsTableColumn<T> {
  label: string;
  key?: keyof T;
  maxWidth?: number;
  isDictionaryCell?: boolean;
  columnLabelVisuallyHidden?: boolean;
  renderOnlyForMasterRow?: boolean;
}

export type HearingsColumnConfig<T> = HearingsTableColumn<T>[];

// ─── Flat render items ─────────────────────────────────────────────────────────

export type HearingsRenderItem =
  | {
      type: 'levelHeader';
      levelPath: string;
      levelIndex: number;
      depth: number;
      levelHeaderId: string;
      cellData: unknown;
      data: unknown;
      ancestorHeaderIds: string;
    }
  | {
      type: 'rowGroup';
      rowGroupData: unknown;
      rowsPath: string;
      depth: number;
      headerIds: string;
    };

export interface HearingsSectionRenderData {
  section: BaseHearingSection;
  items: HearingsRenderItem[];
}

// ─── Base types ────────────────────────────────────────────────────────────────

export interface BaseHearingSection {
  sectionIdentifier: string;
  courtCentre: OrganisationUnit;
}

export interface BaseHearingRowDataVM {
  id: string;
  isMaster?: boolean;
  instances?: number;
  isChild?: boolean;
  isLastChild?: boolean;
  details?: Hearing;
  rowIdentifier: string;
  hearingDate: string;
  sequence: number;
  isDisabled?: boolean;
  checkSplit?: boolean;
}

export interface BaseHearingTable {
  sections?: InputSignal<any[]>;
  sectionConfig?: HearingsTableSectionConfig;
  columnConfig: HearingsColumnConfig<any>;
  getAllMasterHearingRows?: () => HearingRowVM[];
}
