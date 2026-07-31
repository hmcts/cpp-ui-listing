import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ValidationError } from '@cpp/pdk';
import { OrganisationUnit } from '@cpp/reference-data';
import {
  ALLOCATION_FORM_CONFIGS,
  allocationFormConfigs,
  CrownSchedulingFilters,
  CrownSessionStatus,
  HearingSlot
} from '@cpp/scheduling';
import { CrownSchedulingComponent } from './crown-scheduling.component';
import { provideStore } from '@ngrx/store';
import { reducers } from '../../core/';
import { CppHttp } from '@cpp/core';
import { mockFixtureInputs } from '../../../mock-data/mock-fixture-inputs';

describe('CrownSchedulingComponent', () => {
  let fixture: ComponentFixture<CrownSchedulingComponent>;
  let activatedRoute: { snapshot: { queryParams: Record<string, string> } };

  beforeEach(() => {
    activatedRoute = {
      snapshot: {
        queryParams: {
          mf: `{ "isUnscheduled": true }`
        }
      }
    };

    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers, { runtimeChecks: {} }),
        { provide: ActivatedRoute, useValue: activatedRoute },
        {
          provide: CppHttp,
          useValue: {
            query: jasmine.createSpy(),
            commandSync: jasmine.createSpy()
          }
        },
        {
          provide: ALLOCATION_FORM_CONFIGS,
          useValue: allocationFormConfigs
        }
      ],
      teardown: { destroyAfterEach: false }
    });

    fixture = TestBed.createComponent(CrownSchedulingComponent);
    mockFixtureInputs(fixture, {
      filters: {
        panel: 'ADULT,YOUTH'
      }
    });
  });

  it('should compile correctly', () => {
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should raise an error summary', () => {
    fixture.componentInstance.errors = [
      { id: 'id', message: 'Error message' }
    ] as ValidationError[];
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should handle submitting valid filters', () => {
    spyOn(fixture.componentInstance.filtersSubmit, 'emit');

    const filters = {
      courtRoomId: '*',
      courtSession: 'AM',
      sessionStartDate: '2019-01-01',
      sessionEndDate: '2019-01-31',
      panel: 'ADULT,YOUTH',
      businessType: '*',
      organisationUnit: {
        oucodeL3Code: 'ISLEWORTH',
        oucodeL3Name: 'Isleworth Crown Court'
      } as OrganisationUnit,
      sessionStatusFilter: { courtRoomId: undefined, status: undefined },
      status: CrownSessionStatus.FINAL
    } as unknown as CrownSchedulingFilters;

    mockFixtureInputs(fixture, { filters });
    fixture.componentInstance.handleSubmitFilters(filters);

    expect(fixture.componentInstance.filtersSubmit.emit).toHaveBeenCalledWith(filters);
  });

  it('should remove falsy values when submitting filters', () => {
    spyOn(fixture.componentInstance.filtersSubmit, 'emit');

    const filters = {
      courtRoomId: '*',
      courtSession: null,
      sessionStartDate: '2019-01-01',
      sessionEndDate: '2019-01-31',
      panel: 'ADULT,YOUTH',
      businessType: undefined,
      sessionStatusFilter: { courtRoomId: undefined, status: undefined }
    } as unknown as CrownSchedulingFilters;

    mockFixtureInputs(fixture, { filters });
    fixture.componentInstance.handleSubmitFilters(filters);

    expect(fixture.componentInstance.filtersSubmit.emit).toHaveBeenCalledWith(filters);
  });

  it('should apply existing filters to the form', fakeAsync(() => {
    spyOn(fixture.componentInstance.filtersSubmit, 'emit');

    const filters = {
      courtRoomId: '*',
      courtSession: 'AM',
      sessionStartDate: '2019-01-01',
      sessionEndDate: '2019-01-31',
      panel: 'ADULT,YOUTH',
      businessType: 'HEARING_TYPE',
      sessionStatusFilter: { courtRoomId: undefined, status: undefined }
    } as unknown as CrownSchedulingFilters;

    mockFixtureInputs(fixture, { filters });
    fixture.componentInstance.handleSubmitFilters(filters);

    expect(fixture.componentInstance.filtersSubmit.emit).toHaveBeenCalledWith(filters);
  }));

  it('should display the courtrooms for the selected organisation unit', fakeAsync(() => {
    mockFixtureInputs(fixture, {
      filters: {
        panel: 'ADULT,YOUTH',
        organisationUnit: {
          id: '*',
          courtrooms: [
            {
              id: 'COURTROOM_1',
              courtroomId: 1,
              courtroomName: 'Court room 1'
            }
          ]
        } as OrganisationUnit,
        sessionStatusFilter: { courtRoomId: undefined, status: undefined }
      } as unknown as CrownSchedulingFilters
    });

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  }));

  it('should render a search containing no results', () => {
    mockFixtureInputs(fixture, {
      totalResults: 0,
      hearingSlots: []
    });
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  describe('allocationFormConfig', () => {
    it('should return showHearingTypeAndNotification config', () => {
      const config = fixture.componentInstance.allocationFormConfig;
      expect(config).toBe(allocationFormConfigs['showHearingTypeAndNotification']);
    });
  });

  describe('handleSubmitFilters', () => {
    it('should reset slots when present and emit filters', () => {
      const filters = { sessionStartDate: '2019-01-01' } as CrownSchedulingFilters;
      spyOn(fixture.componentInstance.filtersSubmit, 'emit');

      fixture.componentInstance.handleSubmitFilters(filters);

      expect(fixture.componentInstance.filtersSubmit.emit).toHaveBeenCalledWith(filters);
    });
  });

  describe('when hearing slots exist', () => {
    const mockHearingSlots = [
      {
        courtScheduleId: 'A',
        sessionDate: '2019-10-31',
        courtHouseName: 'Isleworth Crown Court',
        courtRoomName: 'Courtroom 2',
        courtSession: 'AM',
        businessType: 'AT',
        availableDuration: 0,
        maxDuration: 0,
        availableSlots: 10,
        maxSlots: 20,
        draft: true
      },
      {
        courtScheduleId: 'B',
        sessionDate: '2019-10-31',
        courtHouseName: 'Isleworth Crown Court',
        courtRoomName: 'Courtroom 2',
        courtSession: 'AM',
        businessType: 'TRL',
        availableSlots: 0,
        maxSlots: 0,
        availableDuration: 90,
        maxDuration: 195,
        draft: true
      },
      {
        courtScheduleId: 'C',
        sessionDate: '2019-11-01',
        courtHouseName: 'Isleworth Crown Court',
        courtRoomName: 'Courtroom 2',
        courtSession: 'AD',
        businessType: 'AT',
        availableDuration: 0,
        maxDuration: 0,
        availableSlots: 10,
        maxSlots: 20,
        draft: true
      },
      {
        courtScheduleId: 'D',
        sessionDate: '2019-11-01',
        courtHouseName: 'Isleworth Crown Court',
        courtRoomName: 'Courtroom 1',
        courtSession: 'AD',
        businessType: 'AT',
        availableDuration: 0,
        maxDuration: 0,
        availableSlots: 10,
        maxSlots: 20,
        draft: true
      },
      {
        courtScheduleId: 'E',
        sessionDate: '2019-11-01',
        courtHouseName: 'Westminster Crown Court',
        courtRoomName: 'Courtroom 2',
        courtSession: 'AD',
        businessType: 'AT',
        availableDuration: 0,
        maxDuration: 0,
        availableSlots: 10,
        maxSlots: 20,
        draft: true
      },
      {
        courtScheduleId: 'F',
        sessionDate: '2025-01-24',
        courtHouseName: 'Isleworth Crown Court',
        courtRoomName: 'Courtroom 1',
        courtSession: 'AD',
        businessType: 'TRL',
        allDaySplit: true,
        availableDuration: 0,
        availableDurationForMorning: 90,
        availableDurationForAfternoon: 120,
        availableSlots: 0,
        maxDuration: 0,
        maxDurationForMorning: 90,
        maxDurationForAfternoon: 120,
        maxSlots: 0
      }
    ] as HearingSlot[];

    beforeEach(() => {
      mockFixtureInputs(fixture, {
        filters: {
          availableDurationMins: 99,
          panel: 'ADULT,YOUTH',
          sessionStatusFilter: { courtRoomId: undefined, status: undefined }
        } as unknown as CrownSchedulingFilters,
        currentPage: 1,
        totalResults: 3,
        hearingSlots: [mockHearingSlots[0], mockHearingSlots[1]]
      });
      fixture.detectChanges();
    });

    it('should render the slots', () => {
      expect(fixture).toMatchSnapshot();
    });
  });
});
