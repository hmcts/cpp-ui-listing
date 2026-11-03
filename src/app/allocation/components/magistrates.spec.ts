import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ModalService, ValidationError } from '@cpp/pdk';
import { OrganisationUnit } from '@cpp/reference-data';
import {
  ALLOCATION_FORM_CONFIGS,
  allocationFormConfigs,
  HearingSlot,
  SchedulingFilters
} from '@cpp/scheduling';
import { MagistratesSchedulingComponent } from './magistrates.component';

import { provideStore } from '@ngrx/store';
import { reducers } from '../../core/';
import { CppHttp } from '@cpp/core';
import { mockFixtureInputs } from '../../../mock-data/mock-fixture-inputs';
import {
  CPPDate,
  ENFORCEMENT_BUSINESS_TYPE_CODE,
  PAST_DATE_MESSAGES,
  PastDateCheck
} from '../../core/util';
import { PastDateWarningModalComponent } from './past-date-warning-modal.component';

describe('MagistratesSchedulingComponent', () => {
  let fixture: ComponentFixture<MagistratesSchedulingComponent>;
  let activatedRoute;

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
        {
          provide: ActivatedRoute,
          useValue: activatedRoute
        },
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

    fixture = TestBed.createComponent(MagistratesSchedulingComponent);
    mockFixtureInputs(fixture, {
      filters: {
        isSlotBased: true
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
      oucodeL2Code: 'OPERATIONALUNITB',
      courtSession: 'AM',
      sessionStartDate: '2019-01-01',
      sessionEndDate: '2019-01-31',
      panel: 'ADULT',
      businessType: '*'
    } as SchedulingFilters;
    mockFixtureInputs(fixture, {
      filters: filters
    });
    fixture.componentInstance.filtersSubmit.emit(filters);

    expect(fixture.componentInstance.filtersSubmit.emit).toHaveBeenCalledWith(filters);
  });

  it('should remove falsy values when submitting filters', () => {
    spyOn(fixture.componentInstance.filtersSubmit, 'emit');

    const filters = {
      oucodeL2Code: 'OPERATIONALUNITB',
      courtSession: null,
      sessionStartDate: '2019-01-01',
      sessionEndDate: '2019-01-31',
      panel: 'ADULT',
      businessType: undefined
    } as SchedulingFilters;
    mockFixtureInputs(fixture, {
      filters: filters
    });
    fixture.componentInstance.filtersSubmit.emit(filters);

    expect(fixture.componentInstance.filtersSubmit.emit).toHaveBeenCalledWith(filters);
  });

  it('should apply existing filters to the form', fakeAsync(() => {
    spyOn(fixture.componentInstance.filtersSubmit, 'emit');

    const filters = {
      oucodeL2Code: '1',
      courtSession: 'AM',
      sessionStartDate: '2019-01-01',
      sessionEndDate: '2019-01-31',
      panel: 'ADULT',
      businessType: 'HEARING_TYPE'
    } as SchedulingFilters;

    mockFixtureInputs(fixture, {
      filters: filters
    });
    fixture.componentInstance.filtersSubmit.emit(filters);

    expect(fixture.componentInstance.filtersSubmit.emit).toHaveBeenCalledWith(filters);
  }));

  it('should display the courtrooms for the selected organisation unit', fakeAsync(() => {
    mockFixtureInputs(fixture, {
      filters: {
        organisationUnit: {
          id: '*',
          courtrooms: [
            {
              id: 'COURTROOM_1',
              courtroomId: 1,
              courtroomName: 'Court room 1'
            }
          ]
        } as OrganisationUnit
      }
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

  describe('when hearing slots exist', () => {
    const mockHearingSlots = [
      {
        courtScheduleId: 'A',
        sessionDate: '2019-10-31',
        courtHouseName: `Lavender Hill Magistrates' Court`,
        courtRoomName: 'Courtroom 2',
        courtSession: 'AM',
        businessType: 'AT',
        availableDuration: 0,
        maxDuration: 0,
        availableSlots: 10,
        maxSlots: 20
      },
      {
        courtScheduleId: 'B',
        sessionDate: '2019-10-31',
        courtHouseName: `Lavender Hill Magistrates' Court`,
        courtRoomName: 'Courtroom 2',
        courtSession: 'AM',
        businessType: 'TRL',
        availableSlots: 0,
        maxSlots: 0,
        availableDuration: 90,
        maxDuration: 195
      },
      {
        courtScheduleId: 'C',
        sessionDate: '2019-11-01',
        courtHouseName: `Lavender Hill Magistrates' Court`,
        courtRoomName: 'Courtroom 2',
        courtSession: 'AD',
        businessType: 'AT',
        availableDuration: 0,
        maxDuration: 0,
        availableSlots: 10,
        maxSlots: 20
      },
      {
        courtScheduleId: 'D',
        sessionDate: '2019-11-01',
        courtHouseName: `Lavender Hill Magistrates' Court`,
        courtRoomName: 'Courtroom 1',
        courtSession: 'AD',
        businessType: 'AT',
        availableDuration: 0,
        maxDuration: 0,
        availableSlots: 10,
        maxSlots: 20
      },
      {
        courtScheduleId: 'E',
        sessionDate: '2019-11-01',
        courtHouseName: `Westminster Magistrates' Court`,
        courtRoomName: 'Courtroom 2',
        courtSession: 'AD',
        businessType: 'AT',
        availableDuration: 0,
        maxDuration: 0,
        availableSlots: 10,
        maxSlots: 20
      },
      {
        courtScheduleId: 'F',
        sessionDate: '2025-01-24',
        courtHouseName: `Lavender Hill Magistrates' Court`,
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
        filters: { availableDurationMins: 99 },
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

  describe('past-dated allocation', () => {
    const today = '2026-10-23';
    const filtersFor = (sessionStartDate: string, businessType?: string) =>
      ({ sessionStartDate, businessType, panel: 'ADULT' }) as SchedulingFilters;
    let modalService: ModalService;
    let modalRef: { dispose: jest.Mock };

    beforeEach(() => {
      jest
        .spyOn(TestBed.inject(CPPDate), 'getCurrentDate')
        .mockReturnValue(new Date(`${today}T10:00:00`));
      modalService = fixture.debugElement.injector.get(ModalService);
      modalRef = { dispose: jest.fn() };
      jest.spyOn(modalService, 'open').mockReturnValue(modalRef as any);
      jest.spyOn(fixture.componentInstance.filtersSubmit, 'emit');
    });

    describe('for a non-Enforcement case', () => {
      it('only allows today and future dates', () => {
        expect(fixture.componentInstance.minimumDate()).toBe(today);
        expect(fixture.componentInstance.startDateErrorMessages()).toContainEqual({
          rule: 'minDate',
          message: PAST_DATE_MESSAGES[PastDateCheck.NotEnforcementCase]
        });
      });

      it('searches when the start date is today', () => {
        fixture.componentInstance.handleSubmitFilters(filtersFor(today));

        expect(fixture.componentInstance.filtersSubmit.emit).toHaveBeenCalledWith(
          filtersFor(today)
        );
        expect(modalService.open).not.toHaveBeenCalled();
      });

      it('shows an error and does not search when the start date is in the past', () => {
        fixture.componentInstance.handleSubmitFilters(
          filtersFor('2026-10-22', ENFORCEMENT_BUSINESS_TYPE_CODE)
        );

        expect(fixture.componentInstance.errors).toEqual([
          { id: 'sessionStartDate', message: PAST_DATE_MESSAGES[PastDateCheck.NotEnforcementCase] }
        ]);
        expect(fixture.componentInstance.filtersSubmit.emit).not.toHaveBeenCalled();
        expect(modalService.open).not.toHaveBeenCalled();
      });
    });

    describe('for an Enforcement case', () => {
      beforeEach(() => {
        mockFixtureInputs(fixture, { isEnforcementCase: true });
      });

      it('allows dates up to 31 days in the past', () => {
        expect(fixture.componentInstance.minimumDate()).toBe('2026-09-22');
        expect(fixture.componentInstance.startDateErrorMessages()).toContainEqual({
          rule: 'minDate',
          message: PAST_DATE_MESSAGES[PastDateCheck.TooFarInPast]
        });
      });

      it('shows a warning and searches on Continue when the date is in the past', () => {
        const filters = filtersFor('2026-10-01', ENFORCEMENT_BUSINESS_TYPE_CODE);
        fixture.componentInstance.handleSubmitFilters(filters);

        expect(modalService.open).toHaveBeenCalledWith(
          PastDateWarningModalComponent,
          expect.anything()
        );
        expect(fixture.componentInstance.filtersSubmit.emit).not.toHaveBeenCalled();

        const { data } = (modalService.open as jest.Mock).mock.calls[0][1];
        data.continue();

        expect(modalRef.dispose).toHaveBeenCalled();
        expect(fixture.componentInstance.filtersSubmit.emit).toHaveBeenCalledWith(filters);
      });

      it('does not search when the warning is cancelled', () => {
        fixture.componentInstance.handleSubmitFilters(
          filtersFor('2026-10-01', ENFORCEMENT_BUSINESS_TYPE_CODE)
        );
        const { data } = (modalService.open as jest.Mock).mock.calls[0][1];
        data.cancel();

        expect(modalRef.dispose).toHaveBeenCalled();
        expect(fixture.componentInstance.filtersSubmit.emit).not.toHaveBeenCalled();
      });

      it('shows an error when the Business Type is not Enforcement', () => {
        fixture.componentInstance.handleSubmitFilters(filtersFor('2026-10-01', 'GEN'));

        expect(fixture.componentInstance.errors).toEqual([
          {
            id: 'sessionStartDate',
            message: PAST_DATE_MESSAGES[PastDateCheck.NotEnforcementBusinessType]
          }
        ]);
        expect(fixture.componentInstance.filtersSubmit.emit).not.toHaveBeenCalled();
        expect(modalService.open).not.toHaveBeenCalled();
      });

      it('searches without a warning when the date is today or later', () => {
        fixture.componentInstance.handleSubmitFilters(filtersFor('2026-10-30', 'GEN'));

        expect(fixture.componentInstance.filtersSubmit.emit).toHaveBeenCalled();
        expect(modalService.open).not.toHaveBeenCalled();
      });
    });
  });
});
