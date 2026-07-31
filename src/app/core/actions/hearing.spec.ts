import { CourtCentre, CourtRestriction, Hearing, SelectedFilterOptions } from '../model/';
import * as HearingActions from './hearing';
import {
  AllocateHearingAction,
  AllocateHearingMagsAction,
  AllocateHearingMagsSuccessAction,
  ChangeJudicaryForHearingsAction,
  ChangeJudicaryForHearingsSuccessAction,
  ClearLastAllocatedHearingAction,
  CourtRestrictionAction,
  CourtRestrictionSuccessAction,
  downloadPrisonListAction,
  GetPublishListStatusAction,
  GetPublishListStatusSuccessAction,
  ListUnallocatedHearingsAction,
  ListUnallocatedHearingsSuccessAction,
  ListUnscheduledHearingsAction,
  ListUnscheduledHearingsSuccessAction,
  ScheduledAllocateHearingAction,
  SearchAllocatedHearingsAction,
  searchAllocatedHearingsForPrisonListAction,
  SearchAllocatedHearingsSuccessAction,
  SequenceHearingAction,
  SequenceHearingSuccessAction,
  setEditAllocationError,
  SetPublishListStatusAction,
  SetPublishListStatusSuccessAction,
  splitHearingUnallocated,
  TypeOfListAction,
  TypeOfListActionSuccess
} from './hearing';
import { OrganisationUnit } from '@cpp/reference-data';
import { TypeOfListSummary } from '../../unscheduled-listings/unscheduled-listings.interfaces';
import {
  HearingSchedule,
  HearingWithSelectedCourtCentre,
  PaginatedHearings,
  PublishCourtListType,
  UnallocatedHearings
} from '../model/hearing';
import { editAllocationError } from '../../../mock-data/test-fixtures';
import { HearingSlot, HearingSlotAllocation } from '@cpp/scheduling';

const courtCentre: CourtCentre = {
  id: '1',
  name: 'test',
  courtRooms: [],
  defaultStartTime: '10:00',
  defaultDuration: '7:00',
  courtCode: 'a'
};

const hearingOne: Hearing = {
  id: 'H001',
  type: { id: '1', description: 'PTP' },
  courtCentreId: '123',
  startDate: '2017-10-01',
  estimatedMinutes: 60,
  allocated: false,
  jurisdictionType: 'CROWN',
  judiciary: [],
  hearingLanguage: 'ENGLISH',
  listedCases: [],
  hearingDays: [],
  nonDefaultDays: [],
  nonSittingDays: []
};

const hearingOneWithSelectedCourtCentre: HearingWithSelectedCourtCentre = {
  ...hearingOne,
  selectedCourtCentre: {
    id: hearingOne.courtCentreId,
    courtRoomId: hearingOne.courtRoomId,
    courtCentreName: 'Lavender Hill Magistrates Court'
  }
};
const organisationUnit: OrganisationUnit = {
  address1: '176A Lavender Hill',
  address2: 'London',
  courtrooms: [
    {
      courtroomId: 2330,
      courtroomName: 'Courtroom 01',
      id: '9e4932f7-97b2-3010-b942-ddd2624e4dd8',
      venueName: `LAVENDER HILL MAGISTRATES' COURT`
    }
  ],
  defaultDurationHrs: '7:00',
  defaultStartTime: '10:00',
  id: 'f8254db1-1683-483e-afb3-b87fde5a0a26',
  lja: '2577',
  oucode: 'B01LY00',
  oucodeL1Code: 'B',
  oucodeL1Name: `Magistrates' Courts`,
  oucodeL2Code: '01',
  oucodeL2Name: 'London',
  oucodeL3Code: 'BB',
  oucodeL3Name: `Lavender Hill Magistrates' Court`,
  oucodeL3WelshName: 'Llys Ynadon Lavender Hill',
  postcode: 'SW11 1JU'
};

const selectedFilterOptions: SelectedFilterOptions = {
  courtCentreId: courtCentre.id,
  authorityId: '123',
  hearingTypeId: '456',
  jurisdictionType: 'CROWN'
};

const unscheduledSelectedFilterOptions: SelectedFilterOptions = {
  oucodeL2Code: organisationUnit.oucodeL2Code,
  courtCentreId: courtCentre.id,
  typeOfList: 'c98cb51f-8639-49c1-91f0-a7e820c34355',
  caseUrn: ''
};

const typeOfList: TypeOfListSummary = {
  value: 'c98cb51f-8639-49c1-91f0-a7e820c34355',
  label: 'Warrant for arrest without bail'
};

const courtRestrictionMock: CourtRestriction = {
  hearingId: '12345',
  caseIds: ['123456'],
  restrictCourtList: true
};

const optionsMock: SelectedFilterOptions = {
  courtCentreId: '123'
};

describe('hearing actions', () => {
  describe('ListUnallocatedHearingsAction', () => {
    it('Should create action', () => {
      const action = new ListUnallocatedHearingsAction(selectedFilterOptions);
      expect({ ...action }).toEqual({
        type: HearingActions.LIST_UNALLOCATED_HEARINGS,
        payload: selectedFilterOptions,
        filterOptions: selectedFilterOptions
      });
    });

    it('Should filter out selected filter options with value of ALL', () => {
      const action = new ListUnallocatedHearingsAction({
        courtCentreId: 'ALL',
        authorityId: '123',
        hearingTypeId: 'ALL',
        jurisdictionType: 'ALL'
      });
      expect({ ...action }).toEqual({
        type: HearingActions.LIST_UNALLOCATED_HEARINGS,
        payload: {
          courtCentreId: 'ALL',
          authorityId: '123',
          hearingTypeId: 'ALL',
          jurisdictionType: 'ALL'
        },
        filterOptions: { authorityId: '123' }
      });
    });
  });

  describe('ListUnscheduledHearingsAction', () => {
    it('Should create action', () => {
      const action = new ListUnscheduledHearingsAction(unscheduledSelectedFilterOptions);
      expect({ ...action }).toEqual({
        type: HearingActions.LIST_UNSCHEDULED_HEARINGS,
        payload: unscheduledSelectedFilterOptions,
        filterOptions: unscheduledSelectedFilterOptions
      });
    });

    it('Should filter out selected filter options with value of ALL', () => {
      const action = new ListUnscheduledHearingsAction({
        oucodeL2Code: 'ALL',
        courtCentreId: 'ALL',
        typeOfList: 'ALL',
        caseUrn: 'TFL7105610'
      });
      expect({ ...action }).toEqual({
        type: HearingActions.LIST_UNSCHEDULED_HEARINGS,
        payload: {
          oucodeL2Code: 'ALL',
          courtCentreId: 'ALL',
          typeOfList: 'ALL',
          caseUrn: 'TFL7105610'
        },
        filterOptions: { caseUrn: 'TFL7105610' }
      });
    });
  });

  describe('TypeOfListAction', () => {
    it('Should create action', () => {
      const action = new TypeOfListAction();
      expect({ ...action }).toEqual({
        type: HearingActions.TYPE_OF_LIST
      });
    });
  });

  it('Should create an ListUnallocatedHearingsSuccessAction action', () => {
    const action = new ListUnallocatedHearingsSuccessAction({
      hearings: [hearingOne]
    } as UnallocatedHearings);
    expect({ ...action }).toEqual({
      type: HearingActions.LIST_UNALLOCATED_HEARINGS_SUCCESS,
      payload: { hearings: [hearingOne] }
    });
  });

  it('Should create an ListUnscheduledHearingsSuccessAction action', () => {
    const action = new ListUnscheduledHearingsSuccessAction({
      hearings: [hearingOne]
    } as PaginatedHearings);
    expect({ ...action }).toEqual({
      type: HearingActions.LIST_UNSCHEDULED_HEARINGS_SUCCESS,
      payload: {
        hearings: [hearingOne]
      }
    });
  });

  it('Should create an TypeOfListActionSuccess action', () => {
    const action = new TypeOfListActionSuccess([typeOfList]);
    expect({ ...action }).toEqual({
      type: HearingActions.TYPE_OF_LIST_SUCCESS,
      payload: [typeOfList]
    });
  });

  it('Should create an SearchAllocatedHearingsAction action', () => {
    const action = new SearchAllocatedHearingsAction({
      options: { courtCentreId: courtCentre.id }
    });
    expect({ ...action }).toEqual({
      type: HearingActions.SEARCH_ALLOCATED_HEARINGS,
      payload: { options: { courtCentreId: courtCentre.id } }
    });
  });

  it('Should create an SearchAllocatedHearingsSuccessAction action', () => {
    const action = new SearchAllocatedHearingsSuccessAction([hearingOne]);
    expect({ ...action }).toEqual({
      type: HearingActions.SEARCH_ALLOCATED_HEARINGS_SUCCESS,
      payload: [hearingOne]
    });
  });

  it('Should create an AllocateHearingAction action', () => {
    const action = new AllocateHearingAction({
      originHearing: hearingOne,
      updatedHearing: hearingOne
    });
    expect({ ...action }).toEqual({
      type: HearingActions.ALLOCATE_HEARING_ACTION,
      payload: { originHearing: hearingOne, updatedHearing: hearingOne }
    });
  });

  it('Should create an UpdateAllocatedHearingAction action', () => {
    const action = new HearingActions.UpdateAllocatedHearingAction({
      originHearing: hearingOneWithSelectedCourtCentre,
      updatedHearing: hearingOneWithSelectedCourtCentre
    });
    expect({ ...action }).toEqual({
      type: HearingActions.UPDATE_ALLOCATED_HEARING_ACTION,
      payload: {
        originHearing: hearingOneWithSelectedCourtCentre,
        updatedHearing: hearingOneWithSelectedCourtCentre
      }
    });
  });

  it('Should create an ClearLastAllocatedHearingAction action', () => {
    const action = new ClearLastAllocatedHearingAction();
    expect({ ...action }).toEqual({
      type: HearingActions.CLEAR_LAST_ALLOCATED_HEARING
    });
  });

  it('Should create a SequenceHearingAction action', () => {
    const action = new SequenceHearingAction({ hearings: [] });
    expect({ ...action }).toEqual({
      type: HearingActions.SEQUENCE_HEARINGS_ACTION,
      payload: { hearings: [] }
    });
  });

  it('Should create a SequenceHearingSuccessAction action', () => {
    const action = new SequenceHearingSuccessAction({ hearings: [] });
    expect({ ...action }).toEqual({
      type: HearingActions.SEQUENCE_HEARINGS_SUCCESS_ACTION,
      payload: { hearings: [] }
    });
  });

  it('Should create a ChangeJudiciaryForHearingsAction action', () => {
    const payload = { hearings: [hearingOne] as HearingWithSelectedCourtCentre[], judiciary: [] };
    const action = new ChangeJudicaryForHearingsAction(payload);
    expect({ ...action }).toEqual({
      type: HearingActions.CHANGE_JUDICIARY_FOR_HEARINGS_ACTION,
      payload
    });
  });

  it('Should create a ChangeJudiciaryForHearingsSuccessAction action', () => {
    const payload = { hearings: [hearingOne], judiciary: [] };
    const action = new ChangeJudicaryForHearingsSuccessAction(payload);
    expect({ ...action }).toEqual({
      type: HearingActions.CHANGE_JUDICIARY_FOR_HEARINGS_SUCCESS_ACTION,
      payload
    });
  });

  it('Should create a CourtRestrictionAction action WITH RESTRICTION AND OPTIONS', () => {
    const payload = { courtRestriction: courtRestrictionMock, options: optionsMock };
    const action = new CourtRestrictionAction(payload);
    expect({ ...action }).toEqual({
      type: HearingActions.COURT_RESTRICTION_ACTION,
      payload
    });
  });

  it('Should create a CourtRestrictionSuccessAction action WITH RESTRICTION', () => {
    const payload = { courtRestriction: courtRestrictionMock };
    const action = new CourtRestrictionSuccessAction(payload);
    expect({ ...action }).toEqual({
      type: HearingActions.COURT_RESTRICTION_SUCCESS_ACTION,
      payload
    });
  });

  it('Should create a WeekCommencingHearingSearchAction action ', () => {
    const payload = { options: selectedFilterOptions };
    const action = new HearingActions.WeekCommencingHearingSearchAction(payload);
    expect({ ...action }).toEqual({
      type: HearingActions.WEEK_COMMENCING_HEARING_ACTION,
      payload
    });
  });

  it('Should create a WeekCommencingHearingSearchSuccessAction', () => {
    const action = new HearingActions.WeekCommencingHearingSearchSuccessAction({
      hearings: [hearingOne]
    } as PaginatedHearings);
    expect({ ...action }).toEqual({
      type: HearingActions.WEEK_COMMENCING_HEARING_SUCCESS_ACTION,
      payload: {
        hearings: [hearingOne]
      }
    });
  });

  it('Should create a GetPublishListStatusAction action ', () => {
    const payload = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListTypes: PublishCourtListType.Draft,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'a new status',
      failureMessage: '',
      weekCommencing: true,
      publishDate: '12-12-2022'
    };
    const action = new GetPublishListStatusAction(payload);
    expect({ ...action }).toEqual({
      type: HearingActions.GET_PUBLISH_LIST_STATUS_ACTION,
      payload
    });
  });

  it('Should create a GetPublishListStatusSuccessAction action ', () => {
    const warnStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Warn,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };
    const firmStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Firm,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };
    const finalStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Final,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };

    const draftStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Final,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };
    const payload = [warnStatus, firmStatus, finalStatus, draftStatus];
    const action = new GetPublishListStatusSuccessAction(payload);
    expect({ ...action }).toEqual({
      type: HearingActions.GET_PUBLISH_LIST_STATUS_SUCCESS_ACTION,
      payload
    });
  });

  it('Should create a SetPublishListStatusAction action ', () => {
    const payload = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListTypes: PublishCourtListType.Draft,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'a new status',
      failureMessage: ''
    };
    const action = new SetPublishListStatusAction(payload);
    expect({ ...action }).toEqual({
      type: HearingActions.SET_PUBLISH_LIST_STATUS_ACTION,
      payload
    });
  });

  it('Should create a SetPublishListStatusSuccessAction action ', () => {
    const payload = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListTypes: PublishCourtListType.Draft,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'a new status',
      failureMessage: ''
    };
    const action = new SetPublishListStatusSuccessAction(payload);
    expect({ ...action }).toEqual({
      type: HearingActions.SET_PUBLISH_LIST_STATUS_SUCCESS_ACTION,
      payload
    });
  });

  it('Should create a AllocateHearingMagsAction action ', () => {
    const slot = {
      courtScheduleId: 'courtScheduleId',
      panel: 'ADULT',
      sessionDate: '01-01-20',
      courtHouseName: 'Lavander',
      courtRoomName: 'courtroomName',
      rotaBusinessTypeCode: 'code',
      courtSession: 'AM',
      maxSlots: 1,
      maxDuration: 1,
      availableSlots: 2,
      availableDuration: 2,
      businessType: 'businessType',
      oucode: 'oucode',
      slotBased: true,
      sessionStartTime: '09:00',
      sessionEndTime: '17:00',
      minHearingTime: '0',
      maxHearingTime: '0',
      minSlots: 0,
      minDuration: 0,
      overbookingAllowed: false,
      slotStartTimes: [
        {
          sessionStartTime: '2020-01-01T10:00:00.000Z',
          sessionEndTime: '2020-01-01T11:00:00.000Z',
          count: 1
        }
      ],
      createdOn: '',
      updatedOn: ''
    } as HearingSlot;
    const payload = {
      hearingSlotAllocations: [
        {
          hearingSlot: slot as HearingSlot,
          duration: 1,
          hearingSlotTime: '2019-10-27'
        }
      ] as HearingSlotAllocation[]
    } as HearingSchedule;

    const action = new AllocateHearingMagsAction(payload);
    expect({ ...action }).toEqual({
      type: HearingActions.ALLOCATE_HEARING_MAGS_ACTION,
      payload
    });
  });

  it('Should create a AllocateHearingMagsSuccessAction action ', () => {
    const action = new AllocateHearingMagsSuccessAction();
    expect({ ...action }).toEqual({
      type: HearingActions.ALLOCATE_HEARING_MAGS_SUCCESS_ACTION
    });
  });

  it('Should create a AllocateHearingMagsSuccessAction action ', () => {
    const payload = {
      ...hearingOne
    } as Hearing;
    const action = new ScheduledAllocateHearingAction(payload);
    expect({ ...action }).toEqual({
      type: HearingActions.SCHEDULED_ALLOCATE_HEARING_ACTION,
      payload
    });
  });

  it('Should create a downloadPrisonList action ', () => {
    const options = {
      courtCentreId: 'courtCentreId-1',
      courtRoomId: 'courtRoomId-1',
      startDate: '2024-07-24',
      endDate: '2024-07-24'
    };
    const action = downloadPrisonListAction({ options });

    expect(action).toEqual({
      type: 'DOWNLOAD_PRISON_LIST',
      options
    });
  });

  it('Should search for allocated hearings for Prison list action ', () => {
    const options = {
      courtCentreId: 'courtCentreId-1',
      courtRoomId: 'courtRoomId-1',
      startDate: '2024-07-24',
      endDate: '2024-07-24'
    };
    const action = searchAllocatedHearingsForPrisonListAction({ options });

    expect(action).toEqual({
      type: 'SEARCH_ALLOCATED_HEARINGS_FOR_PRISON_LIST',
      options
    });
  });

  it('Should dispatch splitHearingUnallocated when split hearing done from Unallocated journey', () => {
    const input = true;
    const action = splitHearingUnallocated({ splitHearingUnallocated: input });
    expect(action).toEqual({
      type: 'SPLIT_HEARING_UNALLOCATED',
      splitHearingUnallocated: true
    });
  });

  it('should dispatch setEditAllocationError', () => {
    const action = setEditAllocationError({ editAllocationError });
    expect(action).toEqual({
      type: 'SET_EDIT_ALLOCATION_ERROR',
      editAllocationError
    });
  });
});
