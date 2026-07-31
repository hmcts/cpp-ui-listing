import { APP_BASE_HREF } from '@angular/common';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { CppHttp } from '@cpp/core';
import { ReferenceDataService } from '@cpp/reference-data';
import { Store } from '@ngrx/store';
import * as moment from 'moment-timezone';
import { of } from 'rxjs';
import { CourtCentre, Hearing, HearingWithSelectedCourtCentre } from '../../../core';
import {
  courtCentreId1,
  courtCentreId2,
  courtCentreId3,
  courtCentres,
  courtRoomId1,
  courtRoomId2,
  courtRoomId3,
  hearingType1,
  hearingTypes,
  judicialmembers,
  multiDayHearing1,
  multiDayHearing2,
  singleDayHearing1,
  startDate,
  warrantHearing
} from '../../../core/services/hearing-search/mock-data';
import { CPPDate } from '../../../core/util';
import { DateRange } from '../date-range/date-range';
import { HearingDetailsFormComponent, SpecialHearingTypes } from './hearing-details-form.component';

@Component({
  template: ` Home `
})
class HomeComponent {}

const hearingHasBeenAllocated = true;

@Component({
  template: `
    <hearing-details-form
      [hearing]="hearing"
      [courtCentres]="courtCentres"
      [selectedCourt]="selectedCourt"
      [hearingTypes]="hearingTypes"
      [hearingHasBeenAllocated]="hearingHasBeenAllocated"
      [minDate]="testMinDate"
      (onSubmit)="testMethod($event)"
      (onCancel)="testMethod($event)"
      (onValidationError)="testMethod($event)"
    ></hearing-details-form>
  `,
  imports: [HearingDetailsFormComponent]
})
class TestHostComponent {
  hearing: Hearing = singleDayHearing1;
  selectedCourt = { id: '72650f14-08a5-4ab3-9888-09fbe869359a' };
  hearingTypes = hearingTypes;
  courtCentres: CourtCentre[] = courtCentres;
  hearingHasBeenAllocated: boolean = hearingHasBeenAllocated;
  testMinDate = startDate;
  testMethod() {}
}

const referenceDataHearingTypesMock = [
  {
    id: hearingType1.id,
    defaultDurationMin: 10
  },
  {
    id: '638ced9d-3f95-4e99-b27b-47fa5a2c6add',
    name: SpecialHearingTypes.WARRANT_OF_FURTHER_DETENTION,
    defaultDurationMin: 15
  }
];

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }
];

const expectedHearingWithNonDefaultStartTimeAndDuration: HearingWithSelectedCourtCentre = {
  allocated: false,
  courtCentreId: '72650f14-08a5-4ab3-9888-09fbe869359a',
  courtRoomId: '4f901e1c-bcee-40c1-b400-60f14d92d2f0',
  endDate: '2018-05-23',
  estimatedMinutes: 30,
  hearingDays: [
    {
      courtCentreId: '72650f14-08a5-4ab3-9888-09fbe869359a',
      courtRoomId: '4f901e1c-bcee-40c1-b400-60f14d92d2f0',
      matchedWithQuery: true,
      durationMinutes: 10,
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 0,
      startTime: '2018-05-23T10:00'
    }
  ],
  hearingLanguage: 'ENGLISH',
  id: '955016e0-5e62-11e8-8160-230c768837f4',
  selectedCourtCentre: {
    id: '72650f14-08a5-4ab3-9888-09fbe869359a',
    courtRoomId: '4f901e1c-bcee-40c1-b400-60f14d92d2f0',
    courtCentreName: 'Liverpool Crown Court'
  },
  sendNotificationToParties: true,
  judiciary: [
    {
      judicialId: '91e49eac-f99c-43dc-9f33-b912ef8ee8e0',
      judicialMember: {
        forenames: 'forname1 forename2',
        id: '91e49eac-f99c-43dc-9f33-b912ef8ee8e0',
        judiciaryType: 'District Judge (MC)',
        seqId: 1,
        surname: 'surname1',
        emailAddress: 'address1'
      },
      judicialRoleType: {
        judiciaryType: 'CIRCUIT_JUDGE'
      }
    },
    {
      judicialId: '2d700917-0b75-49df-abbc-c55045a9aaa4',
      judicialMember: {
        forenames: 'forname3 forename4',
        id: '2d700917-0b75-49df-abbc-c55045a9aaa4',
        judiciaryType: 'Circuit Judge',
        seqId: 1,
        surname: 'surname2',
        emailAddress: 'address2'
      },
      judicialRoleType: {
        judiciaryType: 'DISTRICT_JUDGE'
      }
    }
  ],
  weekCommencingDurationInWeeks: null,
  weekCommencingStartDate: null,
  weekCommencingEndDate: null,
  jurisdictionType: 'CROWN',
  hasVideoLink: false,
  publicListNote: '',
  listedCases: [],
  nonDefaultDays: [
    {
      courtCentreId: '72650f14-08a5-4ab3-9888-09fbe869359a',
      roomId: '4f901e1c-bcee-40c1-b400-60f14d92d2f0',
      duration: 140,
      startTime: '2018-05-23T11:00:00.000Z'
    }
  ],
  nonSittingDays: [],
  startDate: '2018-05-23',
  type: {
    description: 'Sentence',
    id: '955016e0-5e62-11e8-8160-230c768837f6'
  }
};

const expectedHearingWithDefaultStartTimeAndDuration: HearingWithSelectedCourtCentre = {
  allocated: false,
  courtCentreId: '72650f14-08a5-4ab3-9888-09fbe869359a',
  courtRoomId: '4f901e1c-bcee-40c1-b400-60f14d92d2f0',
  endDate: '2018-05-23',
  estimatedMinutes: 30,
  hearingDays: [
    {
      courtCentreId: '72650f14-08a5-4ab3-9888-09fbe869359a',
      courtRoomId: '4f901e1c-bcee-40c1-b400-60f14d92d2f0',
      matchedWithQuery: true,
      durationMinutes: 10,
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 0,
      startTime: '2018-05-23T10:00'
    }
  ],
  selectedCourtCentre: {
    id: '72650f14-08a5-4ab3-9888-09fbe869359a',
    courtRoomId: '4f901e1c-bcee-40c1-b400-60f14d92d2f0',
    courtCentreName: 'Liverpool Crown Court'
  },
  sendNotificationToParties: true,
  hearingLanguage: 'ENGLISH',
  id: '955016e0-5e62-11e8-8160-230c768837f4',
  judiciary: [
    {
      judicialId: '91e49eac-f99c-43dc-9f33-b912ef8ee8e0',
      judicialMember: {
        forenames: 'forname1 forename2',
        id: '91e49eac-f99c-43dc-9f33-b912ef8ee8e0',
        judiciaryType: 'District Judge (MC)',
        seqId: 1,
        surname: 'surname1',
        emailAddress: 'address1'
      },
      judicialRoleType: {
        judiciaryType: 'CIRCUIT_JUDGE'
      }
    },
    {
      judicialId: '2d700917-0b75-49df-abbc-c55045a9aaa4',
      judicialMember: {
        forenames: 'forname3 forename4',
        id: '2d700917-0b75-49df-abbc-c55045a9aaa4',
        judiciaryType: 'Circuit Judge',
        seqId: 1,
        surname: 'surname2',
        emailAddress: 'address2'
      },
      judicialRoleType: {
        judiciaryType: 'DISTRICT_JUDGE'
      }
    }
  ],
  weekCommencingDurationInWeeks: null,
  weekCommencingStartDate: null,
  weekCommencingEndDate: null,
  jurisdictionType: 'CROWN',
  listedCases: [],
  nonDefaultDays: [],
  nonSittingDays: [],
  startDate: '2018-05-23',
  hasVideoLink: false,
  publicListNote: '',
  type: {
    description: 'Sentence',
    id: '955016e0-5e62-11e8-8160-230c768837f6'
  }
};

describe('HearingDetailsFormComponent', () => {
  let component: HearingDetailsFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let getJudicialMembersByNamePattern: jasmine.Spy;
  const select = jasmine.createSpy('select');
  let getHearingTypes: jasmine.Spy;
  let dispatchSpy;

  function submitForm() {
    fixture.debugElement.query(By.css('[data-role="submitBtn"]')).nativeElement.click();
    fixture.detectChanges();
  }

  function cancelForm() {
    fixture.debugElement.query(By.css('#cancelHearingForm')).nativeElement.click();
    fixture.detectChanges();
  }

  function clickMultiDay() {
    const multiDayElemt = fixture.debugElement.query(By.css('[name="multiDay"]')).nativeElement;
    multiDayElemt.click();
    fixture.detectChanges();
  }

  function clickFixedDate() {
    const fixedDate = fixture.debugElement.query(By.css('[name="fixedDate"]')).nativeElement;
    fixedDate.click();
    fixture.detectChanges();
  }

  function clickWeekCommencing() {
    const weekCommencing = fixture.debugElement.query(
      By.css('[name="weekCommencing"]')
    ).nativeElement;
    weekCommencing.click();
    fixture.detectChanges();
  }

  function clickOneWeekDuration() {
    const oneWeek = fixture.debugElement.query(By.css('[name="oneWeek"] input')).nativeElement;
    oneWeek.click();
    fixture.detectChanges();
  }

  function clickTwoWeeksDuration() {
    const twoWeeks = fixture.debugElement.query(By.css('[name="twoWeeks"] input')).nativeElement;
    twoWeeks.click();
    fixture.detectChanges();
  }

  function setWeekCommencingStartDate(startDate: string) {
    const [year, month, day] = startDate.split('-');
    const dateInput = fixture.debugElement.query(
      By.css('[data-test-id="weekCommencingGroup"] [name="datePicker"]')
    );
    const dayInputElement = dateInput.query(By.css('[name="dateDay"]')).nativeElement;
    const monthInputElement = dateInput.query(By.css('[name="dateMonth"]')).nativeElement;
    const yearInputElement = dateInput.query(By.css('[name="dateYear"]')).nativeElement;

    dayInputElement.value = day;
    dayInputElement.dispatchEvent(new Event('input'));
    monthInputElement.value = month;
    monthInputElement.dispatchEvent(new Event('input'));
    yearInputElement.value = year;
    yearInputElement.dispatchEvent(new Event('input'));
  }

  function setStartTimeAndDuration(
    startTimeHours: string,
    startTimeMinutes: string,
    durationHours: string,
    durationMinutes: string
  ) {
    const startTimeHourElement = fixture.debugElement.query(
      By.css('[name="startTime"] div:first-child > input')
    ).nativeElement;
    startTimeHourElement.value = startTimeHours;
    startTimeHourElement.dispatchEvent(new Event('input'));

    const startTimeMinutesElement = fixture.debugElement.query(
      By.css('[name="startTime"] div:nth-child(2) > input')
    ).nativeElement;
    startTimeMinutesElement.value = startTimeMinutes;
    startTimeMinutesElement.dispatchEvent(new Event('input'));

    const durationHoursElement = fixture.debugElement.query(
      By.css('[name="duration"] div:first-child > input')
    ).nativeElement;
    durationHoursElement.value = durationHours;
    durationHoursElement.dispatchEvent(new Event('input'));

    const durationMinutesElement = fixture.debugElement.query(
      By.css('[name="duration"] div:nth-child(2) > input')
    ).nativeElement;
    durationMinutesElement.value = durationMinutes;
    durationMinutesElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();
  }

  function makeStartTimeAndDurationNonDefaultForCourtCentre() {
    setStartTimeAndDuration('11', '00', '2', '20');
  }

  function makeStartTimeAndDurationDefaultForCourtCentre() {
    setStartTimeAndDuration('10', '15', '0', '15');
  }

  function makeStartTimeBlankNonDefaultForCourtCentre() {
    setStartTimeAndDuration('', '', '2', '20');
  }

  function clickNotifyParties() {
    const sendNotificationToParties = fixture.debugElement.query(
      By.css('pdk-radio-group[name="sendNotificationToParties"] input[value="true"]')
    ).nativeElement;
    sendNotificationToParties.click();
  }
  beforeEach(() => {
    getJudicialMembersByNamePattern = jasmine.createSpy('getJudicialMembersByNamePattern');
    getHearingTypes = jasmine.createSpy('getHearingTypes');
    dispatchSpy = jasmine.createSpy('dispatch');

    const mockCppDate = new CPPDate();
    jest
      .spyOn(mockCppDate, 'getCurrentDate')
      .mockReturnValue(new Date(startDate + 'T12:00:00.000Z'));

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ReferenceDataService,
        provideRouter(routes),
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: Store, useValue: { select, dispatch: dispatchSpy } },
        { provide: CPPDate, useValue: mockCppDate },
        {
          provide: CppHttp,
          useValue: {
            query: jasmine.createSpy(),
            commandSync: jasmine.createSpy()
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    getHearingTypes.and.returnValue(of(referenceDataHearingTypesMock));
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    select.and.returnValue(of({ defaultDurationMin: 10 }));

    // pdk-autosuggest input element uses a randomly generated name attribute.
    // Need to make this a fixed name so Jest tests pass between test runs.
    const judgesTypeaheadEl = fixture.debugElement.queryAll(By.css('pdk-autosuggest input'));
    judgesTypeaheadEl.forEach((element) => (element.nativeElement.name = 'stubbed-name'));
    getJudicialMembersByNamePattern.and.returnValue([[...judicialmembers]]);
  });

  afterAll(() => {
    moment.tz.setDefault();
  });

  it('should show component fields for hearing details a single day form', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.whenRenderingDone();
    expect(fixture).toMatchSnapshot();
  });

  it('should show component fields for hearing details a multi day form', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.whenRenderingDone();
    clickMultiDay();

    expect(fixture).toMatchSnapshot();
  });

  it('should show component fields for hearing details a fixed date single day form', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.whenRenderingDone();
    clickFixedDate();
    expect(fixture).toMatchSnapshot();
  });

  it('should show component fields for hearing details a fixed date multi days form', async () => {
    fixture.detectChanges();
    clickFixedDate();
    await fixture.whenStable();
    await fixture.whenRenderingDone();
    clickMultiDay();

    expect(fixture).toMatchSnapshot();
  });

  it('should show component fields for hearing details a week commencing form ', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    clickWeekCommencing();
    expect(fixture).toMatchSnapshot();
  });

  it('should show component fields for hearing details a week commencing form with one week duration ', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    clickWeekCommencing();
    clickOneWeekDuration();
    expect(fixture).toMatchSnapshot();
  });

  it('should show component fields for hearing details a week commencing form with two weeks duration ', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    clickWeekCommencing();
    clickTwoWeeksDuration();
    expect(fixture).toMatchSnapshot();
  });

  it('should create week commencing where one week duration is selected', () => {
    fixture.detectChanges();
    clickWeekCommencing();
    clickOneWeekDuration();
    submitForm();
  });

  it('should create week commencing where two weeks duration is selected', () => {
    fixture.detectChanges();
    clickWeekCommencing();
    clickTwoWeeksDuration();
    submitForm();
  });

  it('should create a non-default day when week commencing with existing hearing days', async () => {
    fixture.detectChanges();
    const onSubmitSpy = spyOn(component.onSubmit, 'emit');
    clickWeekCommencing();
    await fixture.whenStable();
    await fixture.whenRenderingDone();
    setWeekCommencingStartDate('2020-01-01');
    await fixture.whenStable();
    await fixture.whenRenderingDone();
    fixture.detectChanges();
    clickOneWeekDuration();
    await fixture.whenStable();
    fixture.detectChanges();
    clickNotifyParties();
    submitForm();

    expect(component.onSubmit.emit).toHaveBeenCalledTimes(1);
    expect(onSubmitSpy.calls.mostRecent().args[0].updatedHearing.nonDefaultDays.length).toEqual(1);
  });

  it(
    'should create a nonDefaultDay where hearing start date and duration ARE NOT the default for the court centre ' +
      'and hearing is a single day hearing',
    () => {
      fixture.detectChanges();
      spyOn(component.onSubmit, 'emit');
      moment.tz.setDefault('UTC');
      makeStartTimeAndDurationNonDefaultForCourtCentre();
      clickNotifyParties();
      submitForm();

      expect(component.onSubmit.emit).toHaveBeenCalledTimes(1);
      expect(component.onSubmit.emit).toHaveBeenCalledWith({
        originHearing: { ...singleDayHearing1, sendNotificationToParties: false },
        updatedHearing: {
          ...expectedHearingWithNonDefaultStartTimeAndDuration,
          jurisdictionType: 'MAGISTRATES'
        }
      });
    }
  );

  it(
    'should create a nonDefaultDay where the startTime is equal to the court centre default start time ' +
      'when hearing start date is BLANK',
    async () => {
      const onSubmitSpy = spyOn(component.onSubmit, 'emit');
      moment.tz.setDefault('UTC');
      fixture.detectChanges();
      clickFixedDate();

      makeStartTimeBlankNonDefaultForCourtCentre();
      await fixture.whenStable();
      clickNotifyParties();
      submitForm();

      expect(component.onSubmit.emit).toHaveBeenCalledTimes(1);
      expect(
        onSubmitSpy.calls.mostRecent().args[0].updatedHearing.nonDefaultDays[0].startTime
      ).toEqual('2018-05-23T10:15:00.000Z');
    }
  );

  it(
    'should not create a nonDefaultDay where hearing start date and duration ARE the default for the court centre ' +
      'and hearing is a single day hearing',
    () => {
      fixture.detectChanges();
      spyOn(component.onSubmit, 'emit');
      makeStartTimeAndDurationDefaultForCourtCentre();
      clickNotifyParties();
      submitForm();

      expect(component.onSubmit.emit).toHaveBeenCalledTimes(1);
      expect(component.onSubmit.emit).toHaveBeenCalledWith({
        originHearing: { ...singleDayHearing1, sendNotificationToParties: false },
        updatedHearing: {
          ...expectedHearingWithDefaultStartTimeAndDuration,
          jurisdictionType: 'MAGISTRATES'
        }
      });
    }
  );

  it('should set the value of the court house and room from the matched hearing day entry', async () => {
    fixture.detectChanges();
    const courtCentre = fixture.debugElement.query(
      By.css('[name="courtCentreId"] input')
    ).nativeElement;
    fixture.componentInstance.hearing = multiDayHearing1;
    await fixture.whenStable();
    fixture.detectChanges();
    expect(courtCentre.value).toEqual('Liverpool Crown Court');
    fixture.componentInstance.hearing = multiDayHearing2;
    await fixture.whenStable();
    fixture.detectChanges();

    expect(courtCentre.value).toEqual('Liverpool Crown Court');
  });

  it(`should update the court house/room ids in both top level, and the matched non default day
    when the values are changed, and the matched hearing day is first`, () => {
    const onSubmitSpy = spyOn(component.onSubmit, 'emit');
    fixture.componentInstance.hearing = multiDayHearing1; // first hearing day is matched
    fixture.detectChanges();
    const formComponent = fixture.debugElement.query(
      By.directive(HearingDetailsFormComponent)
    ).componentInstance;
    // the following internal variables are controlled by external components
    // (pdk-typeahead, listing-date-range) that would require extensive setup to be mocked
    // they are initialised directly in the component to enable this spec
    formComponent.data.courtCentreId = courtCentreId3;
    formComponent.data.courtRoomId = courtRoomId3;
    formComponent.isMultiDay = true;

    fixture.detectChanges();

    clickNotifyParties();
    submitForm();
    expect(component.onSubmit.emit).toHaveBeenCalledTimes(1);
    const submissionPayload = onSubmitSpy.calls.mostRecent().args[0].updatedHearing;
    expect([submissionPayload.courtCentreId, submissionPayload.courtRoomId]).toEqual([
      courtCentreId3,
      courtRoomId3
    ]);
    expect([
      submissionPayload.nonDefaultDays[0].courtCentreId,
      submissionPayload.nonDefaultDays[0].roomId
    ]).toEqual([courtCentreId3, courtRoomId3]);
    expect([
      submissionPayload.nonDefaultDays[1].courtCentreId,
      submissionPayload.nonDefaultDays[1].roomId
    ]).toEqual([courtCentreId2, courtRoomId2]); // asserting unmatched non default days remain unaffected
  });

  it(`should clear non sitting days when hearing is not multi days`, async () => {
    fixture.detectChanges();
    const onSubmitSpy = spyOn(component.onSubmit, 'emit');
    fixture.componentInstance.hearing = multiDayHearing2; // second hearing day is matched
    const formComponent = fixture.debugElement.query(By.directive(HearingDetailsFormComponent))
      .componentInstance as HearingDetailsFormComponent;
    // the following internal variables are controlled by external components
    // (pdk-typeahead, listing-date-range) that would require extensive setup to be mocked
    // they are initialised directly in the component to enable this spec
    formComponent.data.courtCentreId = courtCentreId3;
    formComponent.data.courtRoomId = courtRoomId3;
    formComponent.data.nonSittingDays = ['2022-03-03'];
    formComponent.isMultiDay = false;
    clickNotifyParties();
    await fixture.whenStable();
    fixture.detectChanges();
    submitForm();

    expect(onSubmitSpy).toHaveBeenCalledTimes(1);
    const submissionPayload = onSubmitSpy.calls.mostRecent().args[0].updatedHearing as
      | Hearing
      | HearingWithSelectedCourtCentre;
    expect(submissionPayload.nonSittingDays).toHaveLength(0);
  });

  it(`should clear non default days when hearing is multi days`, async () => {
    fixture.detectChanges();
    const onSubmitSpy = spyOn(component.onSubmit, 'emit');
    fixture.componentInstance.hearing = multiDayHearing2; // second hearing day is matched
    const formComponent = fixture.debugElement.query(By.directive(HearingDetailsFormComponent))
      .componentInstance as HearingDetailsFormComponent;
    formComponent.data.courtCentreId = courtCentreId3;
    formComponent.data.courtRoomId = courtRoomId3;
    clickNotifyParties();
    await fixture.whenStable();
    fixture.detectChanges();
    // Hide the multi day section by passing false
    formComponent.enableDisableMultiDay(false);

    // Show multi day section by passing true
    formComponent.enableDisableMultiDay(true);
    submitForm();
    expect(component.onSubmit.emit).toHaveBeenCalledTimes(1);
    const submissionPayload = onSubmitSpy.calls.mostRecent().args[0].updatedHearing as
      | Hearing
      | HearingWithSelectedCourtCentre;
    expect(submissionPayload.nonDefaultDays).toHaveLength(0);
  });

  it(`should update the court house/room ids in the matched non default day, but not in the top level
    when the values are changed, and the matched hearing day is not first`, () => {
    const onSubmitSpy = spyOn(component.onSubmit, 'emit');

    fixture.componentInstance.hearing = multiDayHearing2; // second hearing day is matched

    const formComponent = fixture.debugElement.query(
      By.directive(HearingDetailsFormComponent)
    ).componentInstance;
    // the following internal variables are controlled by external components
    // (pdk-typeahead, listing-date-range) that would require extensive setup to be mocked
    // they are initialised directly in the component to enable this spec
    formComponent.data.courtCentreId = courtCentreId3;
    formComponent.data.courtRoomId = courtRoomId3;
    formComponent.isMultiDay = true;
    fixture.detectChanges();
    // component.submit({ value: {} });

    clickNotifyParties();
    submitForm();
    expect(component.onSubmit.emit).toHaveBeenCalledTimes(1);
    const submissionPayload = onSubmitSpy.calls.mostRecent().args[0].updatedHearing;
    expect([submissionPayload.courtCentreId, submissionPayload.courtRoomId]).toEqual([
      courtCentreId1,
      courtRoomId1
    ]);
    expect([
      submissionPayload.nonDefaultDays[1].courtCentreId,
      submissionPayload.nonDefaultDays[1].roomId
    ]).toEqual([courtCentreId2, courtRoomId2]);
    expect([
      submissionPayload.nonDefaultDays[0].courtCentreId,
      submissionPayload.nonDefaultDays[0].roomId
    ]).toEqual([courtCentreId1, courtRoomId1]); // asserting unmatched non default days remain unaffected
  });

  it(`should not invoke logic for matching hearing days, just set the court centre and room ids from the hearing object,
    when hearingHasBeenAllocated is set to false`, async () => {
    fixture.componentInstance.hearing = multiDayHearing2;
    fixture.componentInstance.hearingHasBeenAllocated = false;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const courtCentre = fixture.debugElement.query(
      By.css('[name="courtCentreId"] input')
    ).nativeElement;
    expect(courtCentre.value).toEqual('Liverpool Crown Court');
  });

  it('should fire an event when calling onSubmit', async () => {
    fixture.detectChanges();
    spyOn(component.onSubmit, 'emit');
    spyOn(component.onValidationError, 'emit');
    await fixture.whenStable();
    fixture.detectChanges();
    clickNotifyParties();
    submitForm();

    expect(component.onSubmit.emit).toHaveBeenCalledTimes(1);
    expect(component.onValidationError.emit).toHaveBeenCalledTimes(1);
  });

  it('should fire an event when calling onCancel', () => {
    fixture.detectChanges();
    spyOn(component.onCancel, 'emit');
    spyOn(component.onValidationError, 'emit');

    cancelForm();

    expect(component.onCancel.emit).toHaveBeenCalledTimes(1);
    expect(component.onValidationError.emit).toHaveBeenCalledTimes(1);
    expect(component.onValidationError.emit).toHaveBeenCalledWith(null);
  });

  it('should calculate weekcommencing end date inclusive of start date for one week period', () => {
    fixture.detectChanges();
    const startDate = '2023-04-11';
    component.isWeekCommencing = true;
    component.data.dateRange = new DateRange(startDate, '');
    component.data.weekCommencingDurationInWeeks = 1;

    component.calculatePeriodCommencing();

    expect(component.data.weekCommencingStartDate).toBe(startDate);
    expect(component.data.weekCommencingEndDate).toBe('2023-04-17');
  });

  it('should calculate weekcommencing end date inclusive of start date for two weeks period', () => {
    fixture.detectChanges();
    const startDate = '2023-04-17';
    component.isWeekCommencing = true;
    component.data.dateRange = new DateRange(startDate, '');
    component.data.weekCommencingDurationInWeeks = 2;

    component.calculatePeriodCommencing();

    expect(component.data.weekCommencingStartDate).toBe(startDate);
    expect(component.data.weekCommencingEndDate).toBe('2023-04-30');
  });

  it('should set sendNotificationToParties to true', () => {
    fixture.componentInstance.hearing = { ...singleDayHearing1, sendNotificationToParties: true };
    fixture.detectChanges();

    const formComponent = fixture.debugElement.query(
      By.directive(HearingDetailsFormComponent)
    ).componentInstance;

    expect(formComponent.data.sendNotificationToParties).toBeTruthy();
  });

  it('should set sendNotificationToParties to false', () => {
    fixture.componentInstance.hearing = { ...singleDayHearing1, sendNotificationToParties: false };
    fixture.detectChanges();

    const formComponent = fixture.debugElement.query(
      By.directive(HearingDetailsFormComponent)
    ).componentInstance;

    expect(formComponent.data.sendNotificationToParties).toBeFalsy();
  });

  it('should fall back to court centre defaults when no non-default days exist', () => {
    const hearingWithNoNonDefaultDays = {
      ...singleDayHearing1,
      nonDefaultDays: [],
      hearingDays: []
    };

    fixture.componentInstance.hearing = hearingWithNoNonDefaultDays;
    fixture.componentInstance.hearingHasBeenAllocated = false;
    fixture.detectChanges();

    const formComponent = fixture.debugElement.query(
      By.directive(HearingDetailsFormComponent)
    ).componentInstance;

    expect(formComponent.data.startTime).toBe('10:15');
    expect(formComponent.data.duration).toBe('00:15');
  });

  it('should use matching non-default day when one exists for the start date', () => {
    const hearingWithMatchingNonDefaultDay = {
      ...singleDayHearing1,
      nonDefaultDays: [
        {
          courtCentreId: courtCentreId1,
          roomId: courtRoomId1,
          startTime: '2018-05-23T11:00:00.000Z',
          duration: 120
        }
      ],
      hearingDays: []
    };

    fixture.componentInstance.hearing = hearingWithMatchingNonDefaultDay;
    fixture.componentInstance.hearingHasBeenAllocated = false;
    fixture.detectChanges();

    const formComponent = fixture.debugElement.query(
      By.directive(HearingDetailsFormComponent)
    ).componentInstance;

    expect(formComponent.data.startTime).toBe('11:00');
    expect(formComponent.data.duration).toBe('02:00');
  });

  it('should not disable Yes radio button for other hearing types', async () => {
    fixture.componentInstance.hearing = singleDayHearing1;
    fixture.detectChanges();

    const yesRadioButton = fixture.debugElement.query(
      By.css('pdk-radio-group[name="sendNotificationToParties"] input[value="true"]')
    ).nativeElement;

    expect(yesRadioButton.disabled).toBeFalsy();
  });

  it('should set sendNotificationToParties to false when hearing type is Warrant of Further Detention', async () => {
    fixture.componentInstance.hearing = warrantHearing;
    fixture.detectChanges();

    const formComponent = fixture.debugElement.query(
      By.directive(HearingDetailsFormComponent)
    ).componentInstance;

    expect(formComponent.data.sendNotificationToParties).toBeFalsy();
  });

  it('should disable sendNotificationToParties when description is Warrant of Further Detention', () => {
    component.updateSendNotificationFlag('Warrant of Further Detention');

    expect(component.isSendNotificationDisabled).toBeTruthy();
    expect(component.data.sendNotificationToParties).toBeFalsy();
  });

  it('should not disable sendNotificationToParties for other hearing types', () => {
    component.data.sendNotificationToParties = true;

    component.updateSendNotificationFlag('Bail Application');

    expect(component.isSendNotificationDisabled).toBeFalsy();
    expect(component.data.sendNotificationToParties).toBeTruthy();
  });

  it('should handle undefined hearing type gracefully', () => {
    component.data.sendNotificationToParties = true;

    component.updateSendNotificationFlag(undefined);

    expect(component.isSendNotificationDisabled).toBeFalsy();
    expect(component.data.sendNotificationToParties).toBeTruthy();
  });

  it('should perform a case-insensitive match for warrant of further detention', () => {
    component.data.sendNotificationToParties = true;

    component.updateSendNotificationFlag('warrant of further detention');

    expect(component.isSendNotificationDisabled).toBeTruthy();
    expect(component.data.sendNotificationToParties).toBeFalsy();
  });

  it('should disable sendNotificationToParties when description is Pre-Charge Bail', () => {
    component.data.sendNotificationToParties = true;

    component.updateSendNotificationFlag('Pre-Charge Bail');

    expect(component.isSendNotificationDisabled).toBeTruthy();
    expect(component.data.sendNotificationToParties).toBeFalsy();
  });

  it('should perform a case-insensitive match for Pre-Charge Bail', () => {
    component.data.sendNotificationToParties = true;

    component.updateSendNotificationFlag('pre-charge bail');

    expect(component.isSendNotificationDisabled).toBeTruthy();
    expect(component.data.sendNotificationToParties).toBeFalsy();
  });
});
