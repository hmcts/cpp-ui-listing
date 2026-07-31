import { CourtRoomCalendarVM, HearingRowVM, MagsWidgetCourtroomCalendarVm } from '../../model';
import { ColumnConfig, HearingTableSectionConfig } from '../../model/hearing-table-renderer.vm';

export const AllocatedTableColumnConfig: ColumnConfig<HearingRowVM> = [
  {
    label: 'Select all hearings',
    key: 'id',
    columnLabelVisuallyHidden: true,
    renderOnlyForMasterRow: true
  },
  {
    label: 'Time',
    isDictionaryCell: true,
    key: 'dateTime',
    renderOnlyForMasterRow: true
  },
  {
    label: 'Duration',
    key: 'duration',
    renderOnlyForMasterRow: true
  },
  {
    label: 'Hearing type',
    key: 'hearingType'
  },
  {
    label: 'Defendants',
    key: 'defendants'
  },
  {
    label: 'Offences (by severity)',
    key: 'offences'
  },
  {
    label: 'Public list notes',
    key: 'publicListNote',
    renderOnlyForMasterRow: true
  }
];

export const allocatedTableSectionConfig: HearingTableSectionConfig<
  CourtRoomCalendarVM,
  'judiciaryCalendar',
  'hearingTimeCalendar'
> = {
  actionable: true,
  rowsAreExpandable: true,
  rowsExpandHeaderDescription: 'Use this column to expand the current hearing you are viewing',
  headerCellsVisuallyHidden: false,
  hasTableSectionHeader: true,
  rowGroups: {
    rowGroupsPath: 'judiciaryCalendar',
    headerConfig: {
      rowGroupHeaderPath: 'judiciary'
    },
    dataConfig: {
      rowGroupDataPath: 'hearingTimeCalendar',
      rowsDataPath: 'hearings'
    }
  }
};

export const allocatedHearingWidgetColumnConfig: ColumnConfig<HearingRowVM> = [
  {
    label: 'Time',
    isDictionaryCell: true,
    key: 'dateTime',
    renderOnlyForMasterRow: true
  },
  {
    label: 'Duration',
    key: 'duration',
    renderOnlyForMasterRow: true
  },
  {
    label: 'Hearing type',
    key: 'hearingType'
  },

  {
    label: 'Defendants',
    key: 'defendants',
    maxWidth: 195
  }
];

export const allocatedCrownHearingWidgetSectionConfig: HearingTableSectionConfig<
  CourtRoomCalendarVM,
  'judiciaryCalendar',
  'hearingTimeCalendar'
> = {
  ...allocatedTableSectionConfig,
  headerCellsVisuallyHidden: true,
  hasTableSectionHeader: false
};

export const allocatedMagHearingWidgetSectionConfig: HearingTableSectionConfig<
  MagsWidgetCourtroomCalendarVm,
  'businessTypeCalendar',
  'hearingTimeCalendar'
> = {
  actionable: true,
  rowsAreExpandable: true,
  rowsExpandHeaderDescription: 'Use this column to expand the current hearing you are viewing',
  rowGroups: {
    rowGroupsPath: 'businessTypeCalendar',
    headerConfig: {
      rowGroupHeaderPath: 'businessTypeAndSlot'
    },
    dataConfig: {
      rowGroupDataPath: 'hearingTimeCalendar',
      rowsDataPath: 'hearings'
    }
  },
  headerCellsVisuallyHidden: true,
  hasTableSectionHeader: false
};
