import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllocatedHearingTableContainer } from '../allocated-hearing-table.component';
import { AppConfigService } from '../../../../config';
import { HearingActionsEvent } from '../../renderers/cell-renderers/action-cell.component';
import { courtRoomCalendarMock, mockCaseId, mockCourtCalendarState } from '../../../utils/mocks';
import { JudicialMemberNamePipe } from '@cpp/reference-data';
import { WofdWarningService } from '@cpp/application';

class MockAppConfigService {
  getBaseUrl() {
    return 'mock-base-url/';
  }
  getConfig() {
    return {};
  }
}

describe('AllocatedHearingTableContainer', () => {
  let component: AllocatedHearingTableContainer;
  let fixture: ComponentFixture<AllocatedHearingTableContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: AppConfigService, useClass: MockAppConfigService },
        JudicialMemberNamePipe,
        {
          provide: WofdWarningService,
          useValue: { isWofdApplication: () => false, showModal: () => {} }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllocatedHearingTableContainer);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sections', courtRoomCalendarMock);
    fixture.componentRef.setInput('totalNumber', 50);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('caseNotesMap', {
      mockCaseId: mockCourtCalendarState.caseNotesMap[mockCaseId]
    });
    fixture.componentRef.setInput('selectedHearings', []);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should default page size to 40', () => {
    fixture.detectChanges();
    expect(component.pageSize()).toBe(40);
  });

  it('should emit `pageChange` when the page changes', () => {
    spyOn(component.pageChange, 'emit');

    const newPage = 3;
    component.pageChange.emit(newPage);
    expect(component.pageChange.emit).toHaveBeenCalledWith(newPage);
  });

  it('should emit `onGetCaseNote` when `onGetCaseNote.emit` is called', () => {
    spyOn(component.onGetCaseNote, 'emit');

    const caseId = 'mockCaseId';
    component.onGetCaseNote.emit(caseId);

    expect(component.onGetCaseNote.emit).toHaveBeenCalledWith(caseId);
  });

  it('should populate all hearingRows by calling getAllMasterHearingRows', () => {
    fixture.detectChanges();
    component.ngOnChanges({
      sections: {
        previousValue: undefined,
        isFirstChange: () => true,
        firstChange: true,
        currentValue: [mockCourtCalendarState.allocated.paginatedHearings]
      }
    });

    expect(component.allMasterHearingRows).toEqual(
      courtRoomCalendarMock[0].judiciaryCalendar[0].hearingTimeCalendar[0].hearings
    );
  });

  it('should call onSelectAllHearings with all hearings when selectAllHearing is called', () => {
    spyOn(component.onSelectAllHearings, 'emit');
    component.allMasterHearingRows =
      courtRoomCalendarMock[0].judiciaryCalendar[0].hearingTimeCalendar[0].hearings;
    fixture.detectChanges();
    component.selectAllHearings(true);
    const hearing =
      courtRoomCalendarMock[0].judiciaryCalendar[0].hearingTimeCalendar[0].hearings[0];

    expect(component.onSelectAllHearings.emit).toHaveBeenCalledWith([
      { hearingId: hearing.id, hearingDateTime: hearing.dateTime }
    ]);
  });

  it('should set store action and moveState if action is "move"', () => {
    const event = {
      action: 'move',
      hearingId: 'hid1',
      rowIdentifier: '',
      hearingDate: '',
      rows: []
    } as HearingActionsEvent;
    spyOn(component.actionClicked, 'emit');
    component.onHearingAction(event, '2000-00-00T00:00');
    expect(component.actionClicked.emit).toHaveBeenLastCalledWith({
      ...event,
      hearingDateTime: '2000-00-00T00:00'
    });
  });

  it('should call preventDefault', () => {
    const fakeEvent = new MouseEvent('click');
    spyOn(fakeEvent, 'stopPropagation');
    component.preventDefault(fakeEvent);
    expect(fakeEvent.stopPropagation).toHaveBeenCalled();
  });
});
