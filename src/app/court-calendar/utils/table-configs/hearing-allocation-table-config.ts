import { AllocationHearingsSectionVm, AllocationType, HearingRowVM } from '../../model';
import { ColumnConfig, HearingTableSectionConfig } from '../../model/hearing-table-renderer.vm';

export const AllocationHearingsTableColumnConfig = (
  allocationType: AllocationType
): ColumnConfig<HearingRowVM> => {
  const config: ColumnConfig<HearingRowVM> = [
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

export const AllocationHearingsTableSectionConfig: HearingTableSectionConfig<
  AllocationHearingsSectionVm,
  'allocationCalendar',
  'hearingTimeCalendar'
> = {
  actionable: false,
  rowsAreExpandable: true,
  rowsExpandHeaderDescription: 'Use this column to expand the current hearing you are viewing',
  headerCellsVisuallyHidden: false,
  hasTableSectionHeader: true,
  sectionHeader: {
    key: 'date'
  },
  rowGroups: {
    rowGroupsPath: 'allocationCalendar',
    dataConfig: {
      rowGroupDataPath: 'hearingTimeCalendar',
      rowsDataPath: 'hearings'
    }
  }
};
