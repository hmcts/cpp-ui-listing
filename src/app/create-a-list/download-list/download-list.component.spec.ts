import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getUserRolePermissions, RequiredPermission } from '@cpp/users-groups';
import moment from 'moment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  selectedCourtCentreMock,
  selectedCrownCourtCentreMock,
  selectedOptionsMock
} from '../../../mock-data/test-fixtures';
import { CourtCentre, CourtRoom, CreateListFilterOptions } from '../../core/model';
import {
  HearingsGroupedByDateAndRoom,
  PublishCourtListType,
  PublishStatus
} from '../../core/model/hearing';
import { DownloadListComponent } from './download-list.component';
import { userPermissions } from '../../config';

const publishCourtListPermission: RequiredPermission = userPermissions.publicCourtList;

describe('DownloadListComponent', () => {
  let hostComponent: TestHostComponent;
  let component: DownloadListComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let mockStore: MockStore;
  let dispatchSpy: jasmine.Spy;
  const modalShowSpy = jasmine.createSpy('show');
  const modalHideSpy = jasmine.createSpy('hide');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        { provide: BsModalService, useValue: { show: modalShowSpy } }
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();
  }));

  beforeEach(() => {
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(getUserRolePermissions, [
      { ...publishCourtListPermission, description: '' }
    ]);
    dispatchSpy = spyOn(mockStore, 'dispatch');

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
    hostComponent.selectedCourtCentre = selectedCourtCentreMock;
    hostComponent.selectedOptions = selectedOptionsMock;
    hostComponent.crownSelected = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should show Public & Alphabetical & Standard & Usher list buttons if -> courtRoom=All && date!=weekCommencing', () => {
    expect(component.selectedCourtRoom).toBe(component.ALL_COURTROOMS);
    expect(component.isWeekCommencing).toBe(false);
    const btns = fixture.debugElement.queryAll(By.css('.download-file'));
    expect(btns.length).toBe(5);
    expect(btns[0].nativeElement.textContent).toBe('Online public court list');
    expect(btns[1].nativeElement.textContent).toBe('Standard court list');
    expect(btns[2].nativeElement.textContent).toBe('Public court list');
    expect(btns[3].nativeElement.textContent).toBe('Alphabetical list');
    expect(btns[4].nativeElement.textContent).toBe("Ushers' list");
    expect(fixture).toMatchSnapshot();
  });

  it('should show bench list btn if selected courtRoom is not All courtrooms AND date is not week commencing', () => {
    hostComponent.selectedOptions = {
      ...hostComponent.selectedOptions,
      courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c' // room 5
    };
    fixture.detectChanges();

    expect(component.selectedCourtRoom).not.toBe(component.ALL_COURTROOMS);
    expect(component.isWeekCommencing).toBe(false);
    const benchBtn = fixture.debugElement.query(By.css('.bench'));
    expect(benchBtn).toBeTruthy();
    expect(fixture).toMatchSnapshot();
  });

  it('should show bench restrict btn if courtRoom is selected, date is not week commencing, AND restricted is true', () => {
    hostComponent.selectedOptions = {
      ...hostComponent.selectedOptions,
      courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c' // room 5
    };
    hostComponent.restrictionsExist = true;
    fixture.detectChanges();

    expect(component.selectedCourtRoom).not.toBe(component.ALL_COURTROOMS);
    expect(component.isWeekCommencing).toBe(false);
    const benchRestrictBtn = fixture.debugElement.query(By.css('.bench-restrict'));
    expect(benchRestrictBtn).toBeTruthy();
    expect(fixture).toMatchSnapshot();
  });

  it('should hide standard court list btn when All Courtrooms is selected', () => {
    hostComponent.selectedOptions = {
      ...hostComponent.selectedOptions,
      endDate: '2018-12-25'
    };
    fixture.detectChanges();
    expect(component.isWeekCommencing).toBe(true);

    const formatted = moment(component.selectedOptions().startDate).format('D MMMM YYYY');
    expect(component.selectedDate).toBe(component.WEEK_COMMENCING + formatted);
    expect(component.selectedCourtRoom).toBe(component.ALL_COURTROOMS);

    // Standard court list direct-download button is hidden when All Courtrooms (courtroom must be selected)
    const standardBtn = fixture.debugElement.query(By.css('.standard'));
    expect(standardBtn).toBeFalsy();
    expect(fixture).toMatchSnapshot();
  });

  it('should show publish-list when selectedCourtRoom is All Courtrooms', () => {
    expect(component.selectedCourtRoom).toBe(component.ALL_COURTROOMS);
    const publishList = fixture.debugElement.query(By.css('mags-publish-list'));
    expect(publishList).toBeTruthy();
  });

  it('should not show publish-list when selectedCourtRoom is not All Courtrooms', () => {
    hostComponent.selectedOptions = {
      ...hostComponent.selectedOptions,
      courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c'
    };
    fixture.detectChanges();

    expect(component.selectedCourtRoom).not.toBe(component.ALL_COURTROOMS);
    const publishList = fixture.debugElement.query(By.css('mags-publish-list'));
    expect(publishList).toBeFalsy();
  });

  it('should show Public & Alphabetical & Standard & Usher & Restricted list buttons if -> courtRoom=All && date!=weekCommencing && restricted=true', () => {
    hostComponent.restrictionsExist = true;
    fixture.detectChanges();
    expect(component.selectedCourtRoom).toBe(component.ALL_COURTROOMS);
    expect(component.isWeekCommencing).toBe(false);
    expect(component.restrictionsExist()).toBe(true);
    const btns = fixture.debugElement.queryAll(By.css('.download-file'));
    expect(btns.length).toBe(5);
    expect(btns[0].nativeElement.textContent).toBe('Online public court list');
    expect(btns[1].nativeElement.textContent).toBe('Standard court list');
    expect(btns[2].nativeElement.textContent).toBe('Public court list');
    expect(btns[3].nativeElement.textContent).toBe('Alphabetical list');
    expect(btns[4].nativeElement.textContent).toBe("Ushers' list");
    expect(fixture).toMatchSnapshot();
  });

  it('should show Public & Alphabetical & Standard & Usher & Online Public list buttons if -> courtRoom=All && date!=weekCommencing && restricted=false', () => {
    hostComponent.restrictionsExist = false;
    fixture.detectChanges();
    expect(component.selectedCourtRoom).toBe(component.ALL_COURTROOMS);
    expect(component.isWeekCommencing).toBe(false);
    expect(component.restrictionsExist()).toBe(false);
    const btns = fixture.debugElement.queryAll(By.css('.download-file'));
    expect(btns.length).toBe(5);
    // Order: Online Public, Standard, Public, Alphabetical, Ushers
    expect(btns[0].nativeElement.textContent).toBe('Online public court list');
    expect(btns[1].nativeElement.textContent).toBe('Standard court list');
    expect(btns[2].nativeElement.textContent).toBe('Public court list');
    expect(btns[3].nativeElement.textContent).toBe('Alphabetical list');
    expect(btns[4].nativeElement.textContent).toBe("Ushers' list");

    expect(fixture).toMatchSnapshot();
  });

  it('should not show Online Public court list if -> isHmctsUser=false', () => {
    hostComponent.isHmctsUser = false;
    fixture.detectChanges();
    expect(component.selectedCourtRoom).toBe(component.ALL_COURTROOMS);
    expect(component.isWeekCommencing).toBe(false);
    const btns = fixture.debugElement.queryAll(By.css('.download-file'));
    btns.forEach(btn => {
      expect(btn.nativeElement.textContent).not.toContain('Online public court list');
    });
  });

  it('should hide restrict court list btn if selected courtRoom is All courtrooms AND date is week commencing', () => {
    hostComponent.selectedOptions = {
      ...hostComponent.selectedOptions,
      endDate: '2018-12-25'
    };
    fixture.detectChanges();
    expect(component.isWeekCommencing).toBe(true);

    const formatted = moment(component.selectedOptions().startDate).format('D MMMM YYYY');
    expect(component.selectedDate).toBe(component.WEEK_COMMENCING + formatted);
    expect(component.selectedCourtRoom).toBe(component.ALL_COURTROOMS);

    const restrictBtn = fixture.debugElement.query(By.css('.restrict'));
    expect(restrictBtn).toBeFalsy();
    expect(fixture).toMatchSnapshot();
  });

  it('should hide alphabetical court list btn if selected courtRoom is not All courtrooms OR date is not week commencing', () => {
    hostComponent.selectedOptions = {
      ...hostComponent.selectedOptions,
      courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c' // room 5
    };
    fixture.detectChanges();
    expect(component.isWeekCommencing).toBe(false);

    const alphaBtn = fixture.debugElement.query(By.css('.alpha'));
    expect(alphaBtn).toBeFalsy();
    expect(fixture).toMatchSnapshot();
  });

  describe('judge list', () => {
    let hearingsGroupedByDateAndRoom;

    beforeEach(() => {
      hearingsGroupedByDateAndRoom = [
        {
          date: '2020-10-06',
          hearingsGroupedByJudiciaryAndRoom: [
            {
              courtRoom: {
                id: '731816c1-5ee4-373a-9bda-840e13a5bcb0',
                name: 'Courtroom 01'
              },
              hearingsGroupedByJudiciary: []
            },
            {
              courtRoom: {
                id: 'df4f5204-63d7-3111-a93a-a034ce5ad901',
                name: 'Courtroom 02'
              },
              hearingsGroupedByJudiciary: []
            }
          ]
        } as HearingsGroupedByDateAndRoom
      ];
    });

    it('should show when a crown court is selected and is not week commencing', () => {
      hostComponent.crownSelected = true;
      hostComponent.selectedCourtCentre = selectedCrownCourtCentreMock;
      hostComponent.hearingsByDateAndRoom = hearingsGroupedByDateAndRoom;
      fixture.detectChanges();

      expect(component.isWeekCommencing).toBe(false);
      const judgeList = fixture.debugElement.query(By.css('.judge'));
      expect(judgeList).toBeTruthy();
      expect(fixture).toMatchSnapshot();
    });

    it('should NOT show when a magistrates court is selected', () => {
      hostComponent.crownSelected = false;
      fixture.detectChanges();

      expect(component.isWeekCommencing).toBe(false);
      const judgeList = fixture.debugElement.query(By.css('.judge'));
      expect(judgeList).toBeFalsy();
      expect(fixture).toMatchSnapshot();
    });

    it('should NOT show when week commencing is selected', () => {
      hostComponent.crownSelected = true;
      hostComponent.selectedCourtCentre = selectedCrownCourtCentreMock;
      hostComponent.hearingsByDateAndRoom = hearingsGroupedByDateAndRoom;
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        endDate: '2018-12-25'
      };
      fixture.detectChanges();

      expect(component.isWeekCommencing).toBe(true);
      const judgeList = fixture.debugElement.query(By.css('.judge'));
      expect(judgeList).toBeFalsy();
      expect(fixture).toMatchSnapshot();
    });

    it('#getListOfCourtroomsWithHearings should return courtooom names ', () => {
      const courtrooms = [
        {
          id: '731816c1-5ee4-373a-9bda-840e13a5bcb0',
          name: 'Courtroom 01'
        },
        {
          id: 'df4f5204-63d7-3111-a93a-a034ce5ad901',
          name: 'Courtroom 02'
        }
      ] as CourtRoom[];
      expect(component.getListOfCourtroomsWithHearings(hearingsGroupedByDateAndRoom)).toEqual(
        courtrooms
      );
    });
  });

  describe('download Public List', () => {
    it('should trigger DownloadListAction action when click save public list button ', () => {
      const btn = fixture.debugElement.query(By.css('.public'));
      btn.nativeElement.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('download Alphabetical List', () => {
    it('should trigger DownloadListAction action when click save alphabetical list button ', () => {
      const btn = fixture.debugElement.query(By.css('.alpha'));
      btn.nativeElement.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('download Standard List', () => {
    it('should trigger DownloadListAction when courtroom is selected and Standard button clicked', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c'
      };
      fixture.detectChanges();

      expect(component.selectedCourtRoom).not.toBe(component.ALL_COURTROOMS);
      const standardBtn = fixture.debugElement.query(By.css('.standard'));
      expect(standardBtn).toBeTruthy();
      expect(standardBtn.nativeElement.textContent).toContain('Standard court list');
      standardBtn.nativeElement.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should hide Standard court list button when All Courtrooms is selected', () => {
      expect(component.selectedCourtRoom).toBe(component.ALL_COURTROOMS);
      const standardBtn = fixture.debugElement.query(By.css('.standard'));
      expect(standardBtn).toBeFalsy();
    });
  });

  describe('download Bench List', () => {
    it('should trigger DownloadListAction action when click save bench list button ', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c' // room 5
      };
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.bench'));
      btn.nativeElement.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('download Usher List', () => {
    it('should trigger DownloadListAction action when click on Usher list button ', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c'
      };
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.usher'));
      btn.nativeElement.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('download Judge List', () => {
    let hearingsGroupedByDateAndRoom;

    beforeEach(() => {
      hearingsGroupedByDateAndRoom = [
        {
          date: '2020-10-06',
          hearingsGroupedByJudiciaryAndRoom: [
            {
              courtRoom: {
                id: '731816c1-5ee4-373a-9bda-840e13a5bcb0',
                name: 'Courtroom 01'
              },
              hearingsGroupedByJudiciary: []
            },
            {
              courtRoom: {
                id: 'df4f5204-63d7-3111-a93a-a034ce5ad901',
                name: 'Courtroom 02'
              },
              hearingsGroupedByJudiciary: []
            }
          ]
        } as HearingsGroupedByDateAndRoom
      ];
    });

    it('trigger DownloadListAction action when click one of the judge list links', () => {
      hostComponent.crownSelected = true;
      hostComponent.selectedCourtCentre = selectedCrownCourtCentreMock;
      hostComponent.hearingsByDateAndRoom = hearingsGroupedByDateAndRoom;
      fixture.detectChanges();

      expect(component.isWeekCommencing).toBe(false);
      const judgeListLink = fixture.debugElement.query(By.css('.judgelist-0'));
      judgeListLink.nativeElement.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('download Bench Restrict List', () => {
    it('should trigger DownloadListAction action when click save bench restrict list button ', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c' // room 5
      };
      hostComponent.restrictionsExist = true;
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.bench-restrict'));
      btn.nativeElement.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('when selected option start date is tomorrow', () => {
    const tomorrow = moment().add(1, 'day').format();
    it('should format the selected option start date to display tomorrow  as a prefix before the formatted date', () => {
      const expected = `${component.TOMORROW}${moment().add(1, 'day').format('D MMMM YYYY')}`;
      hostComponent.selectedOptions = {
        ...selectedOptionsMock,
        startDate: tomorrow,
        endDate: tomorrow
      };

      fixture.detectChanges();
      expect(component.selectedDate).toEqual(expected);
    });
  });

  describe('week commencing functionality', () => {
    it('should NOT show draft, final and ushers list download buttons if not crown and not week commencing not selected', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c' // room 5
      };
      hostComponent.crownSelected = false;
      fixture.detectChanges();
      const sharedraftlistBtn = fixture.debugElement.query(
        By.css('[data-role="sharedraftlists-button"]')
      );
      expect(sharedraftlistBtn).toBeFalsy();
      const sharefinallistsBtn = fixture.debugElement.query(
        By.css('[data-role="sharedfinallists-button"]')
      );
      expect(sharefinallistsBtn).toBeFalsy();
      const usherslistBtn = fixture.debugElement.query(By.css('[data-role="usherslist-button"]'));
      expect(usherslistBtn).toBeFalsy();
    });

    it('should show draft, final and ushers list download buttons if crown and not week commencing selected', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c' // room 5
      };
      hostComponent.crownSelected = true;
      fixture.detectChanges();
      const sharedraftlistBtn = fixture.debugElement.query(
        By.css('[data-role="sharedraftlists-button"]')
      );
      expect(sharedraftlistBtn).toBeTruthy();
      const sharefinallistsBtn = fixture.debugElement.query(
        By.css('[data-role="sharedfinallists-button"]')
      );
      expect(sharefinallistsBtn).toBeTruthy();
      const usherslistBtn = fixture.debugElement.query(By.css('[data-role="usherslist-button"]'));
      expect(usherslistBtn).toBeTruthy();
    });

    it('should NOT show share warn, firm list and ushers download buttons if not crown and week commencing is selected', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c',
        endDate: '2019-11-10',
        startDate: '2019-11-04'
      };
      hostComponent.crownSelected = false;
      fixture.detectChanges();
      const sharedWarnlistBtn = fixture.debugElement.query(
        By.css('[data-role="sharewarnlists-button"]')
      );
      expect(sharedWarnlistBtn).toBeFalsy();
      const sharefirmlistsBtn = fixture.debugElement.query(
        By.css('[data-role="sharedfirmlists-button"]')
      );
      expect(sharefirmlistsBtn).toBeFalsy();
      const usherslistBtn = fixture.debugElement.query(By.css('[data-role="usherslist-button"]'));
      expect(usherslistBtn).toBeFalsy();
      expect(component.isWeekCommencing).toBe(true);
    });

    it('should show share warn and firm list download buttons if crown and week commencing is selected', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c',
        endDate: '2019-11-10',
        startDate: '2019-11-04'
      };
      hostComponent.publishCourtListsStatuses = [
        {
          courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
          publishCourtListType: PublishCourtListType.Warn,
          lastUpdated: '2019-11-14T10:45:13Z',
          publishStatus: '',
          failureMessage: ''
        }
      ];
      hostComponent.crownSelected = true;
      fixture.detectChanges();
      const sharedWarnlistBtn = fixture.debugElement.query(
        By.css('[data-role="sharewarnlists-button"]')
      );
      expect(sharedWarnlistBtn).toBeTruthy();
      const sharefirmlistsBtn = fixture.debugElement.query(
        By.css('[data-role="sharedfirmlists-button"]')
      );
      expect(sharefirmlistsBtn).toBeTruthy();
      expect(component.isWeekCommencing).toBe(true);
      expect(component.mapPublishStatuses(PublishCourtListType.Warn)).toBe(
        'Previous warn list published 10:45 14 Nov'
      );
    });

    it('should NOT show Ushers list download button if Crown Court and week commencing is selected', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c',
        endDate: '2019-11-10',
        startDate: '2019-11-04'
      };
      hostComponent.publishCourtListsStatuses = [
        {
          courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
          publishCourtListType: PublishCourtListType.Warn,
          lastUpdated: '2019-11-14T10:45:13Z',
          publishStatus: '',
          failureMessage: ''
        }
      ];
      hostComponent.crownSelected = true;
      fixture.detectChanges();
      const usherslistBtn = fixture.debugElement.query(By.css('[data-role="usherslist-button"]'));
      expect(usherslistBtn).toBeFalsy();
    });

    it('should FORMAT Published message if date contains UTC ', () => {
      const publishStatus = {
        courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
        publishCourtListType: PublishCourtListType.Warn,
        lastUpdated: 'Thu, 14 Nov 2019 08:03:16 GMT',
        publishStatus: '',
        failureMessage: ''
      };
      expect(component.formatMessageWithDate(publishStatus)).toBe(
        'Previous warn list published 08:03 14 Nov'
      );
    });

    it('should handle FORMAT no published status', () => {
      hostComponent.publishCourtListsStatuses = null;
      expect(component.mapPublishStatuses(PublishCourtListType.Final)).toBe(null);
    });
    it('should FORMAT Published message if date is an ISO timestamp', () => {
      const publishStatus = {
        courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
        publishCourtListType: PublishCourtListType.Warn,
        lastUpdated: '2019-11-14T10:45:13Z',
        publishStatus: '',
        failureMessage: ''
      };
      expect(component.formatMessageWithDate(publishStatus)).toBe(
        'Previous warn list published 10:45 14 Nov'
      );
    });

    it('should check if a FINAL Published List already exists ', () => {
      hostComponent.publishCourtListsStatuses = [
        {
          courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
          publishCourtListType: PublishCourtListType.Final,
          lastUpdated: '2019-11-14T10:45:13Z',
          publishStatus: '',
          failureMessage: ''
        }
      ];
      fixture.detectChanges();
      expect(component.checkForPublishStatus(PublishCourtListType.Final)).toBe(true);
    });

    it('should hide DRAFT and show FINAL court list btn if there is a FINAL status', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        endDate: '2018-12-25'
      };
      hostComponent.publishCourtListsStatuses = [
        {
          courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
          publishCourtListType: PublishCourtListType.Final,
          lastUpdated: '2019-11-14T10:45:13Z',
          publishStatus: '',
          failureMessage: ''
        }
      ];
      fixture.detectChanges();
      expect(component.isWeekCommencing).toBe(true);

      const formatted = moment(component.selectedOptions().startDate).format('D MMMM YYYY');
      expect(component.selectedDate).toBe(component.WEEK_COMMENCING + formatted);
      expect(component.selectedCourtRoom).toBe(component.ALL_COURTROOMS);

      const finalBtn = fixture.debugElement.query(By.css('.final'));
      const draftBtn = fixture.debugElement.query(By.css('.draft'));
      expect(draftBtn).toBeFalsy();
      expect(finalBtn).toBeFalsy();
    });

    it('should open Modal via modal service and set up correct values', () => {
      component.openModal(null, 'DRAFT');
      expect(component.listText).toBe('Publish draft list');
      expect(component.modalConfirmMessage).toBe(
        'Are you sure you want to publish the draft hearing list?'
      );
      expect(component.publishListNameSelected).toBe('DRAFT');
      expect(modalShowSpy).toHaveBeenCalledTimes(1);
    });

    it('should Send the correct data when the list is published', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        courtRoomId: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c',
        endDate: '2019-11-10',
        startDate: '2019-11-04'
      };
      component.publishListNameSelected = PublishCourtListType.Draft;
      spyOn(component.onListPublished, 'emit').and.callThrough();
      component.openModal(null, 'DRAFT');
      component.modalRef = { hide: modalHideSpy, content: { channelId: 123 }, setClass: null };

      component.confirmListSubmission();
      expect(modalHideSpy).toHaveBeenCalledTimes(1);
      expect(component.onListPublished.emit).toHaveBeenCalledTimes(1);
      const expectedEvent = {
        courtCentreId: 'd9bff7d8-6168-4163-ad77-3b98d61de174',
        displayDate: '18 December 2018',
        endDate: '2018-12-18',
        publishCourtListType: 'DRAFT',
        startDate: '2018-12-18'
      };
      expect(component.onListPublished.emit).toHaveBeenCalledWith(expectedEvent);
    });

    it('should hide mode when cancelled', () => {
      component.modalRef = { hide: modalHideSpy, content: { channelId: 123 }, setClass: null };
      component.cancelModal();
      expect(modalHideSpy).toHaveBeenCalled();
    });

    it('should show Upcoming hearings and Download upcoming hearings report link if Crown Court is selected and not week commencing', () => {
      hostComponent.crownSelected = true;
      fixture.detectChanges();
      const upcomingHearingsLink = fixture.debugElement.query(
        By.css('[data-role="upcoming-hearings-download"]')
      );
      expect(upcomingHearingsLink).toBeTruthy();
    });

    it('should NOT show Upcoming hearings and Download upcoming hearings report link if Crown Court is selected and week commencing', () => {
      hostComponent.crownSelected = true;
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions,
        endDate: '2018-12-25'
      };
      fixture.detectChanges();
      const upcomingHearingsLink = fixture.debugElement.query(
        By.css('[data-role="upcoming-hearings-download"]')
      );
      expect(upcomingHearingsLink).toBeFalsy();
    });
  });
});

@Component({
  template: `
    <download-list
      [selectedOptions]="selectedOptions"
      [selectedCourtCentre]="selectedCourtCentre"
      [restrictionsExist]="restrictionsExist"
      [crownSelected]="crownSelected"
      [publishCourtListsStatuses]="publishCourtListsStatuses"
      [hearingsByDateAndRoom]="hearingsByDateAndRoom"
      [weekHearingsByDateAndRoom]="weekHearingsByDateAndRoom"
      [isHmctsUser]="isHmctsUser"
      [magPublishListPermissions]="magPublishListPermissions"
    >
    </download-list>
  `,
  imports: [DownloadListComponent]
})
class TestHostComponent {
  selectedCourtCentre: CourtCentre = null;
  selectedOptions: CreateListFilterOptions = null;
  restrictionsExist: boolean = null;
  crownSelected: boolean = null;
  publishCourtListsStatuses: PublishStatus[];
  hearingsByDateAndRoom: HearingsGroupedByDateAndRoom[] = [];
  isHmctsUser: boolean = true;
  magPublishListPermissions: RequiredPermission = publishCourtListPermission;
  weekHearingsByDateAndRoom: HearingsGroupedByDateAndRoom[] = [
    {
      date: '2020-10-06',
      hearingsGroupedByJudiciaryAndRoom: [
        {
          courtRoom: {
            id: '731816c1-5ee4-373a-9bda-840e13a5bcb0',
            name: 'Courtroom 01'
          },
          hearingsGroupedByJudiciary: []
        },
        {
          courtRoom: {
            id: 'df4f5204-63d7-3111-a93a-a034ce5ad901',
            name: 'Courtroom 02'
          },
          hearingsGroupedByJudiciary: []
        }
      ]
    } as HearingsGroupedByDateAndRoom
  ];
}
