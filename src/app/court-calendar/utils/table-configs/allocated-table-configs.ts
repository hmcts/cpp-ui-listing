import { AllocatedWidgetCourtroomCalendarVm, CourtRoomCalendarVM, HearingRowVM } from '../../model';
import {
  HearingsColumnConfig,
  HearingsTableSectionConfig
} from '../../model/hearing-table-renderer.interfaces';
import { defineHearingsGroupLevels } from '../hearing-table-renderer.utils';

export const AllocatedTableColumnConfig: HearingsColumnConfig<HearingRowVM> = [
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

export const allocatedTableSectionConfig: HearingsTableSectionConfig = {
  actionable: true,
  rowsAreExpandable: true,
  rowsExpandHeaderDescription: 'Use this column to expand the current hearing you are viewing',
  headerCellsVisuallyHidden: false,
  hasTableSectionHeader: true,
  groupLevels: defineHearingsGroupLevels<CourtRoomCalendarVM>()
    .group('judiciaryCalendar', { dataPath: 'judiciary' })
    .group('hearingTimeCalendar')
    .rows('hearings')
};

export const allocatedHearingWidgetColumnConfig: HearingsColumnConfig<HearingRowVM> = [
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

export const allocatedWidgetSectionConfig: HearingsTableSectionConfig = {
  actionable: true,
  rowsAreExpandable: true,
  rowsExpandHeaderDescription: 'Use this column to expand the current hearing you are viewing',
  headerCellsVisuallyHidden: true,
  hasTableSectionHeader: false,
  groupLevels: defineHearingsGroupLevels<AllocatedWidgetCourtroomCalendarVm>()
    .group('businessTypeCalendar', { dataPath: 'businessType', bgColor: 'light-grey' })
    .group('sessions', { dataPath: 'slot' })
    .group('judiciaryCalendar', { dataPath: 'judiciary' })
    .group('hearingTimeCalendar')
    .rows('hearings')
};
