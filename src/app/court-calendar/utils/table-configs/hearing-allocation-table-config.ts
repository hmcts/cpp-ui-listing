import { AllocationHearingsSectionVm, AllocationType, HearingRowVM } from '../../model';
import {
  HearingsColumnConfig,
  HearingsTableSectionConfig
} from '../../model/hearing-table-renderer.interfaces';
import { defineHearingsGroupLevels } from '../hearing-table-renderer.utils';

export const AllocationHearingsTableColumnConfig = (
  allocationType: AllocationType
): HearingsColumnConfig<HearingRowVM> => {
  const config: HearingsColumnConfig<HearingRowVM> = [
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
    }
  ];
  if (allocationType === AllocationType.allocate) {
    config.push({
      label: 'Estimated Duration',
      key: 'duration',
      renderOnlyForMasterRow: true
    });
  }

  if (allocationType === AllocationType.reallocate) {
    config.push({
      label: 'Duration',
      key: 'duration',
      renderOnlyForMasterRow: true
    });
  }
  config.push(
    {
      label: 'Hearing type',
      key: 'hearingType'
    },
    {
      label: 'Defendants',
      key: 'defendants'
    }
  );
  return config;
};

export const AllocationHearingsTableSectionConfig: HearingsTableSectionConfig = {
  actionable: false,
  rowsAreExpandable: true,
  rowsExpandHeaderDescription: 'Use this column to expand the current hearing you are viewing',
  headerCellsVisuallyHidden: false,
  hasTableSectionHeader: true,
  sectionHeader: {
    key: 'date'
  },
  groupLevels: defineHearingsGroupLevels<AllocationHearingsSectionVm>()
    .group('allocationCalendar')
    .group('hearingTimeCalendar')
    .rows('hearings')
};
