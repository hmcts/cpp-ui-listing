import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourtroomsFilter, ExtendedJudicialRole, Hearing, HearingState } from '../core';
import { Hearing as LocalHearing } from '../core/model/hearing';
import { DailyCourtRoomCalendarContainer } from './daily-court-room-calendar.container';
import { validHearingMock1, validHearingMock2 } from '../../mock-data/test-fixtures';
import { HearingType } from '@cpp/reference-data';
import { CourtRestriction } from '../core/model/court-restriction';
import { provideMockStore } from '@ngrx/store/testing';
import { By } from '@angular/platform-browser';
import { ValidationError } from '@cpp/pdk';
import { AppConfigService } from '../config';
import { ListingNoteContainerComponent } from '@cpp/scheduling';
import { CaseAccessAlertComponent } from './case-access-alert/case-access-alert.component';
import { HearingsPerJudiciaryComponent } from '../shared/components/hearings-per-judiciary/hearings-per-judiciary.component';
import { TotalListingHoursComponent } from './total-listing-hours/total-listing-hours.component';
import { JsonPipe } from '@angular/common';
import { WofdWarningService } from '@cpp/application';

@Component({
  selector: 'total-listing-hours',
  template: `
    <div>Hearing: {{ hearings() | json }}</div>
    <div>Filter options: {{ filterOptions() | json }}</div>
  `,
  imports: [JsonPipe]
})
class MockTotalListingHours {
  readonly hearings = input<Hearing[]>(undefined);
  readonly filterOptions = input<CourtroomsFilter>(undefined);
}

@Component({
  selector: 'listing-note-container',
  template: `
    <div id="listing-note-container">
      <div>courtRoomId: {{ courtRoomId() | json }}</div>
      <div>listingNoteDate: {{ listingNoteDate() | json }}</div>
    </div>
  `,
  imports: [JsonPipe]
})
class MockListNoteContainerComponent {
  readonly courtRoomId = input<string>(undefined);
  readonly listingNoteDate = input<string>(undefined);
  readonly onErrors = output<ValidationError[]>();
}

@Component({
  selector: 'case-access-alert',
  template: `
    <div id="case-access-alert">
      <div>Urs: {{ urns() | json }}</div>
      <div>Hearing ids: {{ hearingIds() | json }}</div>
      <div>Selected group id: {{ selectedHearingId() | json }}</div>
      <div>User id: {{ userId() }}</div>
    </div>
  `,
  imports: [JsonPipe]
})
class MockCaseAlertComponent {
  readonly urns = input<string[]>([]);
  readonly userId = input<string>(undefined);
  readonly hearingIds = input<string[]>([]);
  readonly selectedHearingId = input<string>(undefined);
  readonly searchDate = input<string>(undefined);
  readonly onCancel = output<void>();
}

@Component({
  selector: 'hearings-per-judiciary',
  template: `
    <div id="hearings-per-judiciary">
      <div>Hearings: {{ hearings() | json }}</div>
      <div>Judiciary: {{ judiciary() | json }}</div>
      <div>EnableAction: {{ enableAction() }}</div>
      <div>LatestSelection: {{ latestSelection() | json }}</div>
      <div>SelectedDate: {{ selectedDate() }}</div>
      <div>FilterOptions: {{ filterOptions() }}</div>
      <div>DefaultStartTime: {{ defaultStartTime() }}</div>
      <div>PreSelectedHearing: {{ preSelectedHearing() }}</div>
      <div>TimeFormat: {{ timeFormat() }}</div>
      <div>EnableReorder: {{ enableReorder() }}</div>
      <div>RestrictedCourtHearingSelected: {{ restrictedCourtHearingSelected() }}</div>
      <div>RestrictLists: {{ restrictLists() }}</div>
      <div>WeekCommencingSelected: {{ weekCommencingSelected() }}</div>
      <div>hearingTypes: {{ hearingTypes() | json }}</div>
      <div>baseUrl: {{ baseUrl() | json }}</div>
    </div>
  `,
  imports: [JsonPipe]
})
class MockHearingPerJudiciary {
  readonly hearings = input<Hearing[]>(undefined);
  readonly judiciary = input<ExtendedJudicialRole[]>(undefined);
  readonly enableAction = input(false);
  readonly latestSelection = input<Hearing>(undefined);
  readonly selectedDate = input<string>(undefined);
  readonly filterOptions = input<CourtroomsFilter>(undefined);
  readonly defaultStartTime = input('10:30');
  readonly preSelectedHearing = input<Hearing>(undefined);
  readonly timeFormat = input('HH:mm');
  readonly enableReorder = input(false);
  readonly restrictedCourtHearingSelected = input<Hearing>(undefined);
  readonly restrictLists = input<boolean>(undefined);
  readonly weekCommencingSelected = input<boolean>(undefined);
  readonly hearingTypes = input<HearingType[]>(undefined);
  readonly baseUrl = input<string>(undefined);
  readonly onHearingSelected = output<Hearing>();
  readonly onSelectChangeJudiciary = output<Hearing[]>();
  readonly onRestrictionChanged = output<CourtRestriction>();
  readonly onApplicationLinkClick = output<{
    applicationId: string;
    applicationTypeCode: string;
  }>();
}

@Component({
  template: `
    <daily-court-room-calendar
      [enableAction]="enableAction"
      [filterOptions]="filterOptions"
      [selectedHearingId]="selectedHearingId"
      (clearSidebar)="clearSidebar()"
      (onHearingSelected)="onHearingSelected()"
      (onSelectChangeJudiciary)="onSelectChangeJudiciary()"
    >
    </daily-court-room-calendar>
  `,
  imports: [DailyCourtRoomCalendarContainer]
})
class TestHostComponent {
  filterOptions: CourtroomsFilter = {
    courtCentreId: 'courtCentreId',
    courtRoomId: 'courtRoomId',
    searchDate: '2018-11-10'
  };
  enableAction = false;
  selectedHearingId;
  onHearingSelected = jest.fn();
  onSelectChangeJudiciary = jest.fn();
  clearSidebar = jest.fn();
}

describe('DailyCourtRoomCalendarContainer', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testComponent: TestHostComponent;
  let initialState;
  let getBaseUrlSpy;
  let mockWofdWarningService: { isWofdApplication: jest.Mock; showModal: jest.Mock };

  const nativeDate = Date.now;

  validHearingMock1.hearingDays[0].hearingDate = '2020-02-07T10:20:30Z';
  const hearings: LocalHearing[] = [validHearingMock1, validHearingMock2];
  const hearingState: HearingState = {
    allocated: hearings,
    lastAllocatedHearing: null,
    restrictedHearing: null,
    restrictListExpanded: null
  } as HearingState;

  const referenceData = {
    prosecutors: [],
    hearingTypes: [],
    jusrisdictions: [],
    organisationUnits: []
  };

  beforeEach(() => {
    global.Date.now = jest.fn(() => new Date('2020-02-07T10:20:30Z').getTime());
    getBaseUrlSpy = jasmine.createSpy().and.returnValue('http://url.com');

    initialState = {
      hearings: hearingState,
      referencedata: referenceData,
      usersGroups: { userDetails: { userId: 'userId' } }
    };

    mockWofdWarningService = {
      isWofdApplication: jest.fn().mockReturnValue(false),
      showModal: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState }),
        { provide: AppConfigService, useValue: { getBaseUrl: getBaseUrlSpy } },
        { provide: WofdWarningService, useValue: mockWofdWarningService }
      ],
      teardown: { destroyAfterEach: false }
    }).overrideComponent(DailyCourtRoomCalendarContainer, {
      remove: {
        imports: [
          ListingNoteContainerComponent,
          CaseAccessAlertComponent,
          HearingsPerJudiciaryComponent,
          TotalListingHoursComponent
        ]
      },
      add: {
        imports: [
          MockCaseAlertComponent,
          MockListNoteContainerComponent,
          MockHearingPerJudiciary,
          MockTotalListingHours
        ]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    global.Date.now = nativeDate;
  });

  it('should match render the component', async () => {
    await fixture.whenStable();
    expect(fixture).toMatchSnapshot();
  });

  it('should render case alert component', async () => {
    await fixture.whenStable();
    const hearingPerJudiciary = fixture.debugElement.query(
      By.directive(MockHearingPerJudiciary)
    ).componentInstance;

    hearingPerJudiciary.onHearingSelected.emit(validHearingMock1);
    fixture.detectChanges();

    await fixture.whenStable();
    const caseAlertComponent = fixture.debugElement.query(
      By.css('case-access-alert')
    ).nativeElement;

    expect(caseAlertComponent).toMatchSnapshot();
  });

  it('should handle modal cancel', async () => {
    await fixture.whenStable();
    const hearingPerJudiciary = fixture.debugElement.query(
      By.directive(MockHearingPerJudiciary)
    ).componentInstance;
    hearingPerJudiciary.onHearingSelected.emit(validHearingMock1);
    fixture.detectChanges();

    await fixture.whenStable();
    const caseAlertComponent = fixture.debugElement.query(
      By.directive(MockCaseAlertComponent)
    ).componentInstance;
    caseAlertComponent.onCancel.emit();

    expect(testComponent.clearSidebar).toHaveBeenCalled();
  });

  it('should select hearing', async () => {
    await fixture.whenStable();
    const hearingPerJudiciary = fixture.debugElement.query(
      By.directive(MockHearingPerJudiciary)
    ).componentInstance;
    hearingPerJudiciary.onHearingSelected.emit(validHearingMock1);
    fixture.detectChanges();
    expect(testComponent.onHearingSelected).toHaveBeenCalled();
  });

  it('should change judiciary', async () => {
    await fixture.whenStable();
    const hearingPerJudiciary = fixture.debugElement.query(
      By.directive(MockHearingPerJudiciary)
    ).componentInstance;
    hearingPerJudiciary.onSelectChangeJudiciary.emit(validHearingMock1);
    fixture.detectChanges();
    expect(testComponent.onSelectChangeJudiciary).toHaveBeenCalled();
  });

  it('should render listing container component', async () => {
    await fixture.whenStable();
    const listingContainerComponent = fixture.debugElement.query(
      By.css('listing-note-container')
    ).nativeElement;

    expect(listingContainerComponent).toMatchSnapshot();
  });

  describe('handleApplicationLinkClick', () => {
    let container: DailyCourtRoomCalendarContainer;
    let windowOpenSpy: jest.SpyInstance;

    beforeEach(async () => {
      await fixture.whenStable();
      container = fixture.debugElement.query(
        By.directive(DailyCourtRoomCalendarContainer)
      ).componentInstance;
      windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();
    });

    afterEach(() => {
      windowOpenSpy.mockRestore();
    });

    it('should navigate directly for non-WOFD application when no hearing allocation is selected', () => {
      mockWofdWarningService.isWofdApplication.mockReturnValue(false);

      container.handleApplicationLinkClick({
        applicationId: 'app-123',
        applicationTypeCode: 'STANDARD'
      });

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'http://url.com/prosecution-casefile/application-at-a-glance/app-123',
        '_blank'
      );
      expect(mockWofdWarningService.showModal).not.toHaveBeenCalled();
    });

    it('should show WOFD modal for WOFD application when no hearing allocation is selected', () => {
      mockWofdWarningService.isWofdApplication.mockReturnValue(true);

      container.handleApplicationLinkClick({
        applicationId: 'app-456',
        applicationTypeCode: 'WOFD'
      });

      expect(mockWofdWarningService.showModal).toHaveBeenCalledWith({
        onProceed: expect.any(Function)
      });
      expect(windowOpenSpy).not.toHaveBeenCalled();
    });

    it('should navigate to AAAG when WOFD modal onProceed is called', () => {
      mockWofdWarningService.isWofdApplication.mockReturnValue(true);

      container.handleApplicationLinkClick({
        applicationId: 'app-789',
        applicationTypeCode: 'WOFD'
      });

      const { onProceed } = mockWofdWarningService.showModal.mock.calls[0][0];
      onProceed();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'http://url.com/prosecution-casefile/application-at-a-glance/app-789',
        '_blank'
      );
    });

    describe('order of selection: hearing allocation (>) selected BEFORE clicking URN link', () => {
      beforeEach(() => {
        const hearingPerJudiciary = fixture.debugElement.query(
          By.directive(MockHearingPerJudiciary)
        ).componentInstance;
        hearingPerJudiciary.onHearingSelected.emit(validHearingMock1);
        fixture.detectChanges();
      });

      it('should still navigate directly for non-WOFD application even when hearing allocation is already active (showModal$ SINGLE)', () => {
        mockWofdWarningService.isWofdApplication.mockReturnValue(false);

        container.handleApplicationLinkClick({
          applicationId: 'app-after-allocation',
          applicationTypeCode: 'STANDARD'
        });

        expect(windowOpenSpy).toHaveBeenCalledWith(
          'http://url.com/prosecution-casefile/application-at-a-glance/app-after-allocation',
          '_blank'
        );
      });

      it('should still show WOFD modal for WOFD application even when hearing allocation is already active (showModal$ SINGLE)', () => {
        mockWofdWarningService.isWofdApplication.mockReturnValue(true);

        container.handleApplicationLinkClick({
          applicationId: 'app-wofd-after-allocation',
          applicationTypeCode: 'WOFD'
        });

        expect(mockWofdWarningService.showModal).toHaveBeenCalledWith({
          onProceed: expect.any(Function)
        });
      });
    });

    describe('order of selection: URN link clicked WITHOUT prior hearing allocation', () => {
      it('should navigate directly for non-WOFD application when showModal$ is null (no prior > click)', () => {
        mockWofdWarningService.isWofdApplication.mockReturnValue(false);

        container.handleApplicationLinkClick({
          applicationId: 'app-no-allocation',
          applicationTypeCode: 'STANDARD'
        });

        expect(windowOpenSpy).toHaveBeenCalledWith(
          'http://url.com/prosecution-casefile/application-at-a-glance/app-no-allocation',
          '_blank'
        );
      });

      it('should show WOFD modal for WOFD application when showModal$ is null (no prior > click)', () => {
        mockWofdWarningService.isWofdApplication.mockReturnValue(true);

        container.handleApplicationLinkClick({
          applicationId: 'app-wofd-no-allocation',
          applicationTypeCode: 'WOFD'
        });

        expect(mockWofdWarningService.showModal).toHaveBeenCalledWith({
          onProceed: expect.any(Function)
        });
      });
    });
  });
});
