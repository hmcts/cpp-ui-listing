import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HearingSlot, HearingSlotAllocation } from '@cpp/scheduling';
import moment from 'moment';
import { courtCentresMock, validHearingMock1 } from '../../../../mock-data/test-fixtures';
import { BailStatus } from '../../../core';
import { LastAllocatedHearing } from './../../../core/model/last-allocated-hearing';
import { AppNotificationComponent } from './notification';

@Component({
  selector: 'notification-test',
  template: `
    <app-notification
      [lastAllocatedHearing]="lastAllocatedHearing"
      [courtCentres]="courtCentres"
      [allocation]="allocation"
      (onDestroy)="testMethod($event)"
    >
    </app-notification>
  `,
  imports: [AppNotificationComponent]
})
class NotificationTest {
  lastAllocatedHearing: LastAllocatedHearing = {
    hearing: validHearingMock1,
    availableHearing: false
  };
  courtCentres = courtCentresMock;
  allocation: HearingSlotAllocation;
  testMethod() {}
}

describe('AppNotificationComponent', () => {
  let component: AppNotificationComponent;
  let testHostComponent: NotificationTest;
  let fixture: ComponentFixture<NotificationTest>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationTest);
    testHostComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should display the minimal message + specified start-time in non-default-days', () => {
    testHostComponent.lastAllocatedHearing = {
      hearing: validHearingMock1,
      availableHearing: false
    };
    testHostComponent.lastAllocatedHearing.hearing.weekCommencingStartDate = null;
    fixture.detectChanges();
    const content = fixture.nativeElement
      .querySelector('pdk-context-panel')
      .textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ')
      .trim();
    expect(content).toEqual(
      'Harry KANE JUNIOR, John SMITH has been allocated to Liverpool Crown Court, Courtroom 3-1 on 5 November 2018 at 11:00'
    );
  });

  it('should display the minimal message + default court start-time', () => {
    const hearing = Object.assign({}, validHearingMock1);
    hearing.startDate = '2018-10-04';
    testHostComponent.lastAllocatedHearing = {
      hearing,
      availableHearing: false
    };
    testHostComponent.lastAllocatedHearing.hearing.weekCommencingStartDate = null;
    fixture.detectChanges();
    const content = fixture.nativeElement
      .querySelector('pdk-context-panel')
      .textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ')
      .trim();
    expect(content).toEqual(
      'Harry KANE JUNIOR, John SMITH has been allocated to Liverpool Crown Court, Courtroom 3-1 on 4 October 2018 at 10:30'
    );
  });

  it('should display the minimal message + default court start-time for fixed date with court room', () => {
    const hearing = Object.assign({}, validHearingMock1);
    hearing.startDate = '2018-10-04';
    testHostComponent.lastAllocatedHearing.hearing = hearing;
    fixture.detectChanges();
    const content = fixture.nativeElement
      .querySelector('pdk-context-panel')
      .textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ')
      .trim();
    expect(content).toEqual(
      'Harry KANE JUNIOR, John SMITH has been allocated to Liverpool Crown Court, Courtroom 3-1 on 4 October 2018 at 10:30'
    );
  });

  it('should display the minimal message + default court start-time for week commencing without court room', () => {
    const hearing = Object.assign({}, validHearingMock1);
    hearing.startDate = '2018-10-04';
    hearing.courtRoomId = 'NONE';
    hearing.weekCommencingStartDate = '2018-10-04';
    testHostComponent.lastAllocatedHearing = {
      availableHearing: false,
      hearing
    };
    fixture.detectChanges();
    const content = fixture.nativeElement
      .querySelector('pdk-context-panel')
      .textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ')
      .trim();
    expect(content).toEqual(
      'Harry KANE JUNIOR, John SMITH has been allocated to Liverpool Crown Court, on week commencing 4 October 2018 at 11:00'
    );
  });

  it('should display the first defendant alphabetically by suranme', () => {
    const defendant1 = {
      id: 'e1d32d9d-29ec-4934-a932-22a50f223967',
      lastName: 'Winner',
      offences: [],
      firstName: 'Michael',
      bailStatus: {
        code: 'A',
        description: 'Not applicable',
        id: '86009c70-759d-3308-8de4-194886ff9a77'
      } as BailStatus,
      dateOfBirth: '2010-01-01',
      organisationId: 'c54eafee-698b-4262-8883-2beca5f8e940',
      custodyTimeLimit: '2018-10-31',
      organisationName: 'Bodge It & Injure People Ltd',
      specificRequirements: 'Screen'
    };

    const defendant2 = {
      id: 'a1d32d9d-29ec-4934-a932-22a50f223967',
      lastName: 'Smith',
      offences: [],
      firstName: 'John',
      bailStatus: {
        code: 'A',
        description: 'Not applicable',
        id: '86009c70-759d-3308-8de4-194886ff9a77'
      } as BailStatus,
      dateOfBirth: '2010-01-01',
      organisationId: 'c54eafee-698b-4262-8883-2beca5f8e940',
      custodyTimeLimit: '2018-10-31',
      organisationName: 'Bodge It & Injure People Ltd',
      specificRequirements: 'Screen'
    };

    const hearing = Object.assign({}, validHearingMock1);
    hearing.listedCases[0].defendants = [defendant1, defendant2];
    testHostComponent.lastAllocatedHearing = {
      hearing,
      availableHearing: false
    };
    fixture.detectChanges();
    const content = fixture.nativeElement
      .querySelector('pdk-context-panel')
      .textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ')
      .trim();
    expect(content).toEqual(
      'John SMITH, Michael WINNER has been allocated to Liverpool Crown Court, Courtroom 3-1 on 5 November 2018 at 11:00'
    );
  });

  it('should display the first defendant alphabetically by suranme for slots', () => {
    const defendant1 = {
      id: 'e1d32d9d-29ec-4934-a932-22a50f223967',
      lastName: 'Winner',
      offences: [],
      firstName: 'Michael',
      bailStatus: {
        code: 'A',
        description: 'Not applicable',
        id: '86009c70-759d-3308-8de4-194886ff9a77'
      } as BailStatus,
      dateOfBirth: '2010-01-01',
      organisationId: 'c54eafee-698b-4262-8883-2beca5f8e940',
      custodyTimeLimit: '2018-10-31',
      organisationName: 'Bodge It & Injure People Ltd',
      specificRequirements: 'Screen'
    };

    const defendant2 = {
      id: 'a1d32d9d-29ec-4934-a932-22a50f223967',
      lastName: 'Smith',
      offences: [],
      firstName: 'John',
      bailStatus: {
        code: 'A',
        description: 'Not applicable',
        id: '86009c70-759d-3308-8de4-194886ff9a77'
      } as BailStatus,
      dateOfBirth: '2010-01-01',
      organisationId: 'c54eafee-698b-4262-8883-2beca5f8e940',
      custodyTimeLimit: '2018-10-31',
      organisationName: 'Bodge It & Injure People Ltd',
      specificRequirements: 'Screen'
    };
    const hearingSlot = {
      courtScheduleId: 'courtScheduleId',
      sessionDate: '2020-07-01',
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
      panel: 'ADULT',
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
          sessionStartTime: '2020-07-01T10:00:00.000Z',
          sessionEndTime: '2020-07-01T11:00:00.000Z',
          count: 1
        }
      ],
      createdOn: '',
      updatedOn: ''
    } as HearingSlot;

    const hearing = Object.assign({}, validHearingMock1);
    hearing.listedCases[0].defendants = [defendant1, defendant2];
    testHostComponent.lastAllocatedHearing = {
      hearing: hearing,
      availableHearing: false
    };
    testHostComponent.allocation = {
      hearingSlot,
      hearingSlotTime: '2020-07-01T09:00:00.000Z'
    };
    fixture.detectChanges();
    const content = fixture.nativeElement
      .querySelector('pdk-context-panel')
      .textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ')
      .trim();
    expect(content).toEqual(
      `John SMITH, Michael WINNER has been allocated to Lavander, courtroomName on 1 July 2020 at ${moment(
        component.allocation().hearingSlotTime
      ).format('HH:mm')}`
    );
  });

  it('should display the first defendant alphabetically by suranme for slots', () => {
    const defendant1 = {
      id: 'e1d32d9d-29ec-4934-a932-22a50f223967',
      lastName: 'Winner',
      offences: [],
      firstName: 'Michael',
      bailStatus: {
        code: 'A',
        description: 'Not applicable',
        id: '86009c70-759d-3308-8de4-194886ff9a77'
      } as BailStatus,
      dateOfBirth: '2010-01-01',
      organisationId: 'c54eafee-698b-4262-8883-2beca5f8e940',
      custodyTimeLimit: '2018-10-31',
      organisationName: 'Bodge It & Injure People Ltd',
      specificRequirements: 'Screen'
    };

    const defendant2 = {
      id: 'a1d32d9d-29ec-4934-a932-22a50f223967',
      lastName: 'Smith',
      offences: [],
      firstName: 'John',
      bailStatus: {
        code: 'A',
        description: 'Not applicable',
        id: '86009c70-759d-3308-8de4-194886ff9a77'
      } as BailStatus,
      dateOfBirth: '2010-01-01',
      organisationId: 'c54eafee-698b-4262-8883-2beca5f8e940',
      custodyTimeLimit: '2018-10-31',
      organisationName: 'Bodge It & Injure People Ltd',
      specificRequirements: 'Screen'
    };

    const hearingSlot = {
      courtScheduleId: 'courtScheduleId',
      sessionDate: '2020-01-01',
      courtHouseName: 'Lavander',
      courtRoomName: 'courtroomName',
      rotaBusinessTypeCode: 'code',
      courtSession: 'PM',
      maxSlots: 1,
      maxDuration: 1,
      availableSlots: 2,
      availableDuration: 2,
      businessType: 'businessType',
      oucode: 'oucode',
      panel: 'ADULT',
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

    const hearing = Object.assign({}, validHearingMock1);
    hearing.listedCases[0].defendants = [defendant1, defendant2];
    testHostComponent.lastAllocatedHearing = {
      hearing: hearing,
      availableHearing: false
    };
    testHostComponent.allocation = {
      hearingSlot,
      hearingSlotTime: '2020-01-01T14:00:00.000Z'
    };
    fixture.detectChanges();
    const content = fixture.nativeElement
      .querySelector('pdk-context-panel')
      .textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ')
      .trim();
    expect(content).toEqual(
      `John SMITH, Michael WINNER has been allocated to Lavander, courtroomName on 1 January 2020 at ${moment(
        component.allocation().hearingSlotTime
      ).format('HH:mm')}`
    );
  });

  it('should call method on onDestroy when component gets destroyed', () => {
    spyOn(component.onDestroy, 'emit');
    fixture.destroy();
    expect(component.onDestroy.emit).toHaveBeenCalled();
  });
});
