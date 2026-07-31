import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CppHttp } from '@cpp/core';
import { cold } from 'jasmine-marbles';
import { omit } from 'lodash-es';
import lolex from 'lolex';
import moment from 'moment';
import uuid from 'uuid/v4';
import { of } from 'rxjs';
import {
  ExtendedJudicialRole,
  Hearing,
  HearingWithSelectedCourtCentre,
  ListedCase,
  PublishCourtListType,
  PublishStatus
} from '../../model/hearing';
import { ListingService } from './listing.service';
import { CourtListType } from '../../../create-a-list/models/mags-publish-list.dto';
import {
  hearing,
  hearingId,
  hearings,
  HearingWithCourtCentre,
  judiciaryForHearings,
  mockearchAvailableHearingsFormOptions,
  mockFilterOptionsForDownloadList,
  mockFilterOptionsForDownloadPrisonList,
  mockFilterOptionsForTests,
  mockFilterOptionsUnallocated,
  mockFilterOptionsUnscheduled,
  permissions,
  sequencedHearings,
  sequenceHearingsCommand,
  updatedHearing
} from './mocks';
import { CourtApplication } from '../../model';
import { AppConfigService } from '../../../config';
import { extendedJudiciaryMember2, extendedJudiciaryMember4 } from '../hearing-search/mock-data';
import { AddPermissionPayload, UsersGroupsService } from '@cpp/users-groups';
import { provideStore, Store } from '@ngrx/store';
import { AppState, reducers } from '../../reducers';
import { JudiciaryTypesGroups } from '@cpp/reference-data';
import { ListingNote } from '@cpp/scheduling';

jest.mock('uuid/v4');

uuid.mockImplementation(() => {
  return 'mock-uuid';
});

describe('ListingService', () => {
  let getNotificationEmailTemplateId: jasmine.Spy;
  let getUsersByPlacementAndRole: jasmine.Spy;
  let getPermissionsBy: jasmine.Spy;
  let revokeUserPermissions: jasmine.Spy;
  let addBulkPermissions: jasmine.Spy;
  let selectSpy;
  let dispatchSpy;
  let state;
  const store: Store<AppState> = null;

  function toHttpParams(params: any) {
    return Object.getOwnPropertyNames(params).reduce(
      (p, key) => p.set(key, params[key]),
      new HttpParams()
    );
  }

  beforeAll(() => {
    jest.useFakeTimers();
    lolex.install({ now: 123456 });
  });

  describe('#ListingService', () => {
    let service: ListingService;
    let http: CppHttp;

    beforeEach(() => {
      getNotificationEmailTemplateId = jasmine.createSpy('getNotificationEmailTemplateId');
      getUsersByPlacementAndRole = jasmine.createSpy('getUsersByPlacementAndRole');
      getPermissionsBy = jasmine.createSpy('getPermissionsBy');
      revokeUserPermissions = jasmine.createSpy('revokeUserPermissions');
      addBulkPermissions = jasmine.createSpy('addBulkPermissions');

      dispatchSpy = jasmine.createSpy('dispatch');
      selectSpy = jasmine.createSpy('select').and.callFake(selectorFunc => {
        return of(selectorFunc.call(store, state));
      });

      state = {
        referenceData: {
          organisationUnits: [{ id: 'id', oucode: '123' }]
        }
      };

      TestBed.configureTestingModule({
        providers: [
          provideStore(reducers, { runtimeChecks: {} }),
          { provide: Store, useValue: { select: selectSpy, dispatch: dispatchSpy } },
          ListingService,
          {
            provide: AppConfigService,
            useValue: {
              load: jasmine.createSpy('load'),
              getAccountUrl: jasmine.createSpy('getAccountUrl'),
              getBaseUrl: jasmine.createSpy('getBaseUrl'),
              getLogoutUrl: jasmine.createSpy('getLogoutUrl'),
              getServicesUrl: jasmine.createSpy('getServicesUrl'),
              getNotificationEmailTemplateId
            }
          },
          {
            provide: CppHttp,
            useValue: {
              query: jasmine.createSpy('query'),
              command: jasmine.createSpy('command'),
              commandSync: jasmine.createSpy('commandSync')
            }
          },
          {
            provide: UsersGroupsService,
            useValue: {
              getPermissionsBy,
              revokeUserPermissions,
              addBulkPermissions,
              getUsersByPlacementAndRole
            }
          }
        ],
        teardown: { destroyAfterEach: false }
      });
      http = TestBed.inject(CppHttp);
      service = TestBed.inject(ListingService);
    });

    describe('fetchHearingById()', () => {
      it('should fetch an unallocated hearing by its id', () => {
        expect.assertions(2);

        (http.query as jasmine.Spy).and.returnValue(of(hearing));

        service.fetchHearingById('HEARING_ID').subscribe(result => {
          expect(result).toEqual(hearing);
          expect(http.query).toHaveBeenCalledWith({
            url: '/listing-query-api/query/api/rest/listing/hearings/HEARING_ID',
            requestType: 'application/vnd.listing.search.hearing+json'
          });
        });
      });
    });

    describe('publishCourtListStatus()', () => {
      it('should publish the court list status', () => {
        const response$ = cold('-x|');
        const expected$ = cold('-x|');

        (http.command as jasmine.Spy).and.returnValue(response$);

        const body: PublishStatus = {
          courtCentreId: 'courtCentreId',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          publishCourtListType: PublishCourtListType.Final
        };
        const command$ = service.publishCourtListStatus(body);

        expect(command$).toBeObservable(expected$);
        expect(http.command as jasmine.Spy).toHaveBeenCalledWith({
          url: `/listing-command-api/command/api/rest/listing/publishCourtList/courtCentreId`,
          requestType: 'application/vnd.listing.command.publish-court-list+json',
          body: {
            ...body,
            requestedTime: `${moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSS')}Z`
          }
        });
      });
    });

    describe('retrieveLatestCourtListStatus()', () => {
      it('should fetch the latest court list status', () => {
        const response = {
          publishCourtListStatuses: { courtCentreId: '*' } as PublishStatus
        };
        const response$ = cold('-(a|)', { a: response });
        const expected$ = cold('-(b|)', {
          b: response.publishCourtListStatuses
        });

        (http.query as jasmine.Spy).and.returnValue(response$);

        const params: PublishStatus = {
          weekCommencing: true,
          publishDate: new Date().toString(),
          courtCentreId: 'courtCentreId'
        };
        const query$ = service.retrieveLatestCourtListStatus(params);
        const httpParams = new HttpParams({
          fromObject: {
            publishCourtListTypes: 'FIRM,WARN,DRAFT,FINAL',
            weekCommencing: true,
            publishDate: new Date().toString()
          } as any
        });

        expect(query$).toBeObservable(expected$);
        expect(http.query as jasmine.Spy).toHaveBeenCalledWith({
          url: `/listing-query-api/query/api/rest/listing/courtListPublishStatus/courtCentreId?${httpParams.toString()}`,
          requestType: 'application/vnd.listing.court.list.publish.status+json'
        });
      });
    });

    describe('search tests', () => {
      let url = '/listing-query-api/query/api/rest/listing/hearings/range-search';
      const searchRequestType = 'application/vnd.listing.search.hearings+json';
      const searchAvailableHearingsRequestType = 'application/vnd.listing.search.hearings+json';

      it('#getUnallocatedHearings', () => {
        const httpResponse$ = cold('-a|', { a: { hearings, results: 100, pageCount: 2 } });
        const expected$ = cold('-b|', { b: { hearings, results: 100, pageCount: 2 } });

        const querySpy = jasmine.createSpy('getUnallocatedHearings').and.returnValue(httpResponse$);
        http.query = querySpy;
        expect(service.getUnallocatedHearings(mockFilterOptionsUnallocated)).toBeObservable(
          expected$
        );
        expect(querySpy.calls.mostRecent().args[0].url).toEqual(url);
        expect(querySpy.calls.mostRecent().args[0].requestType).toEqual(searchRequestType);
      });

      it('#getUnallocatedHearing without all params', () => {
        const httpResponse$ = cold('-a|', { a: { hearings } });
        const expected$ = cold('-b|', { b: { hearings } });
        const querySpy = jasmine.createSpy('getUnallocatedHearings').and.returnValue(httpResponse$);
        http.query = querySpy;
        expect(service.getUnallocatedHearings(mockFilterOptionsForTests)).toBeObservable(expected$);
        expect(querySpy.calls.mostRecent().args[0].url).toEqual(url);
        expect(querySpy.calls.mostRecent().args[0].requestType).toEqual(searchRequestType);
      });

      it('#getAllocatedHearings', () => {
        const httpResponse$ = cold('-a|', { a: { hearings, results: 100, pageCount: 2 } });
        const expected$ = cold('-b|', { b: { hearings, results: 100, pageCount: 2 } });
        const querySpy = jasmine.createSpy('getUnallocatedHearings').and.returnValue(httpResponse$);
        http.query = querySpy;
        const query$ = service.getAllocatedHearings(mockFilterOptionsForTests);
        expect(query$).toBeObservable(expected$);
        expect(querySpy.calls.mostRecent().args[0].url).toEqual(url);
        expect(querySpy.calls.mostRecent().args[0].requestType).toEqual(searchRequestType);
      });
      it('#searchHearingsWithTimeRange', () => {
        url = '/listing-query-api/query/api/rest/listing/hearings/';

        const httpResponse$ = cold('-a|', {
          a: { hearings, notes: [{ id: 'note-id' } as ListingNote] }
        });
        const expected$ = cold('-b|', {
          b: { hearings, notes: [{ id: 'note-id' } as ListingNote] }
        });

        const querySpy = jasmine
          .createSpy('searchHearingsWithTimeRange')
          .and.returnValue(httpResponse$);
        http.query = querySpy;
        const query$ = service.searchHearingsWithTimeRange(mockFilterOptionsForTests);
        expect(query$).toBeObservable(expected$);
        expect(querySpy.calls.mostRecent().args[0].url).toEqual(url);
        expect(querySpy.calls.mostRecent().args[0].requestType).toEqual(searchRequestType);
      });
      it('#searchAvailableHearings', () => {
        url = '/listing-service/query/api/rest/listing/hearings/available-search/';

        const httpResponse$ = cold('-a|', {
          a: { hearings, notes: [{ id: 'note-id' } as ListingNote] }
        });
        const expected$ = cold('-b|', {
          b: { hearings, notes: [{ id: 'note-id' } as ListingNote] }
        });

        const querySpy = jasmine
          .createSpy('searchAvailableHearings')
          .and.returnValue(httpResponse$);
        http.query = querySpy;
        const query$ = service.searchAvailableHearings(mockearchAvailableHearingsFormOptions);
        expect(query$).toBeObservable(expected$);
        expect(querySpy.calls.mostRecent().args[0].url).toEqual(url);
        expect(querySpy.calls.mostRecent().args[0].requestType).toEqual(
          searchAvailableHearingsRequestType
        );
      });
    });

    describe('searchUnscheduledHearings()', () => {
      const url = '/listing-query-api/query/api/rest/listing/hearings/unscheduled';
      const searchRequestType = 'application/vnd.listing.search.hearings+json';

      it('#getUnscheduledHearings', () => {
        const httpResponse$ = cold('-a|', { a: { hearings, results: 100, pageCount: 2 } });
        const expected$ = cold('-b|', { b: { hearings, results: 100, pageCount: 2 } });

        const querySpy = jasmine.createSpy('getUnscheduledHearings').and.returnValue(httpResponse$);
        http.query = querySpy;
        expect(service.getUnscheduledHearings(mockFilterOptionsUnscheduled)).toBeObservable(
          expected$
        );
        expect(querySpy.calls.mostRecent().args[0].url).toEqual(url);
        expect(querySpy.calls.mostRecent().args[0].requestType).toEqual(searchRequestType);
      });
    });

    it('#updateAllocatedHearing with fixed date', () => {
      const hearingWithFixedDate = {
        id: 'hearingId',
        type: {
          id: '123',
          description: 'PTP'
        },
        nonSittingDays: [],
        courtCentreId: '123',
        courtRoomId: 'courtroomId',
        selectedCourtCentre: {
          id: '123',
          courtRoomId: 'courtroomId'
        },
        jurisdictionType: 'CROWN',
        hearingLanguage: 'ENGLISH',
        judiciary: [],
        nonDefaultDays: [],
        startDate: '2018-05-30',
        endDate: '2018-05-30',
        publicListNote: 'test-public-list-note',
        hasVideoLink: true
      } as HearingWithSelectedCourtCentre;

      const response = { body: '*' };
      const response$ = cold('-a|', { a: response });
      const expected$ = cold('-b|', { b: response });

      http.commandSync = jasmine.createSpy('updateAllocatedHearing').and.returnValue(response$);

      const command$ = service.updateAllocatedHearing(hearingWithFixedDate);

      expect(command$).toBeObservable(expected$);

      expect(http.commandSync).toHaveBeenCalledWith({
        url: `/listing-command-api/command/api/rest/listing/hearings/hearingId`,
        requestType: 'application/vnd.listing.command.update-hearing-for-listing+json',
        successEvent: 'public.listing.hearing-updated',
        body: {
          ...omit(hearingWithFixedDate, 'id')
        }
      });
    });

    it('#updateAllocatedHearing nonDefaultDays should have duration', () => {
      const hearingWithFixedDate = {
        id: 'hearingId',
        type: {
          id: '123',
          description: 'PTP'
        },
        nonSittingDays: [],
        courtCentreId: '123',
        courtRoomId: 'courtroomId',
        selectedCourtCentre: {
          id: '123',
          courtRoomId: 'courtroomId'
        },
        jurisdictionType: 'CROWN',
        hearingLanguage: 'ENGLISH',
        judiciary: [],
        nonDefaultDays: [
          {
            courtCentreId: 'f8254db1-1683-483e-afb3-b87fde5a0a26',
            courtRoomId: 2330,
            courtScheduleId: '86c58842-22c1-3cdb-9d22-964b81ffa02d',
            oucode: 'B01LY00',
            roomId: '9e4932f7-97b2-3010-b942-ddd2624e4dd8',
            session: 'AM',
            startTime: '2021-02-02T10:00:00.000Z'
          },
          {
            courtCentreId: 'f8254db1-1683-483e-afb3-b87fde5a0a26',
            courtRoomId: 2330,
            courtScheduleId: '86c58842-22c1-3cdb-9d22-964b81ffa02d',
            oucode: 'B01LY00',
            duration: 30,
            roomId: '9e4932f7-97b2-3010-b942-ddd2624e4dd8',
            session: 'AM',
            startTime: '2021-02-02T10:00:00.000Z'
          }
        ],
        startDate: '2018-05-30',
        endDate: '2018-05-30',
        publicListNote: 'test-public-list-note',
        hasVideoLink: true
      } as HearingWithSelectedCourtCentre;

      const response = { body: '*' };
      const response$ = cold('-a|', { a: response });
      const expected$ = cold('-b|', { b: response });

      http.commandSync = jasmine.createSpy('updateAllocatedHearing').and.returnValue(response$);

      const command$ = service.updateAllocatedHearing(hearingWithFixedDate);

      expect(command$).toBeObservable(expected$);

      expect(http.commandSync).toHaveBeenCalledWith({
        url: `/listing-command-api/command/api/rest/listing/hearings/hearingId`,
        requestType: 'application/vnd.listing.command.update-hearing-for-listing+json',
        successEvent: 'public.listing.hearing-updated',
        body: {
          ...omit(
            {
              ...hearingWithFixedDate,
              nonDefaultDays: [
                { ...hearingWithFixedDate.nonDefaultDays[0], duration: 0 },
                { ...hearingWithFixedDate.nonDefaultDays[1], duration: 30 }
              ]
            },
            'id'
          )
        }
      });
    });

    it('#updateUnallocatedHearing with week commencing', () => {
      const expectedBody = omit(
        {
          ...updatedHearing,
          weekCommencingStartDate: '2018-05-30',
          weekCommencingEndDate: '2018-05-30',
          weekCommencingDurationInWeeks: 1,
          splitHearing: 'unallocated'
        },
        ['courtRoomId']
      );

      const response = { body: '*' };
      const response$ = cold('-a|', { a: response });
      const expected$ = cold('-b|', { b: response });

      http.commandSync = jasmine.createSpy('updateUnallocatedHearing').and.returnValue(response$);
      const hearingWithWeekCommencing = {
        ...hearing,
        weekCommencingStartDate: '2018-05-30',
        weekCommencingEndDate: '2018-05-30',
        weekCommencingDurationInWeeks: 1
      };
      const prosecutionCases = [];
      const splitHearingUnallocated = true;
      const command$ = service.updateUnallocatedHearing(
        hearingWithWeekCommencing,
        prosecutionCases,
        splitHearingUnallocated
      );

      expect(command$).toBeObservable(expected$);
      expect(http.commandSync).toHaveBeenCalledWith({
        url: `/listing-command-api/command/api/rest/listing/hearings/${hearingId}`,
        requestType: 'application/vnd.listing.command.update-hearing-for-listing+json',
        successEvent: 'public.listing.hearing-days-changed-for-hearing',
        body: expectedBody
      });
    });

    it('#allocateHearing', () => {
      const params = {
        hearingId: 'hearingId',
        courtCentreId: '*',
        judiciary: [
          {
            judicialId: 'judicialId',
            judicialMember: {},
            judicialRoleType: {
              judiciaryType: 'CIRCUIT_JUDGE'
            }
          }
        ] as ExtendedJudicialRole[]
      } as Parameters<ListingService['allocateHearing']>[0];

      const response = { body: '*' };
      const response$ = cold('-a|', { a: response });
      const expected$ = cold('-b|', { b: response });
      const splitHearingUnallocated = false;

      http.commandSync = jasmine.createSpy('allocateHearing').and.returnValue(response$);

      const command$ = service.allocateHearing(params, splitHearingUnallocated);

      const { hearingId: id, ...body } = params;

      expect(command$).toBeObservable(expected$);
      expect(http.commandSync).toHaveBeenCalledWith({
        url: `/listing-command-api/command/api/rest/listing/hearings/${id}`,
        requestType: 'application/vnd.listing.command.update-hearing-for-listing+json',
        successEvent: 'public.listing.hearing-changes-saved',
        body: {
          ...body,
          judiciary: [
            {
              judicialId: 'judicialId',
              judicialRoleType: {
                judiciaryType: 'CIRCUIT_JUDGE'
              }
            }
          ]
        }
      });
    });

    describe('#getCaseNotesForCases', () => {
      it('it should fetch case notes for cases', () => {
        const caseIds = ['caseId1'];

        const response = { caseNotes: [] };
        const response$ = cold('-(a|)', { a: response });
        const expected$ = cold('-(b|)', { b: { caseId1: [] } });

        http.query = jasmine.createSpy('getCaseNotesForCases').and.returnValue(response$);
        const query$ = service.getCaseNotesForCases(caseIds);

        expect(query$).toBeObservable(expected$);
        expect(http.query).toHaveBeenCalledWith({
          background: false,
          url: `/progression-query-api/query/api/rest/progression/cases/caseId1/notes`,
          requestType: 'application/vnd.progression.query.case-notes+json'
        });
      });
    });

    describe('#grantBulkJudiciaryPermission', () => {
      it('it should return without involing permissions if no cpUserId is present for judiciaries', () => {
        const hearingMock: Hearing = {
          ...hearing,
          listedCases: [
            { id: permissions.permissions[0].target } as ListedCase,
            { id: permissions.permissions[2].target } as ListedCase
          ]
        };

        const judiciariesMock: ExtendedJudicialRole[] = [
          {
            judicialId: '35d194e8-c194-34d9-a27b-b41c8cae904e',
            judicialRoleType: {
              judiciaryType: 'DEPUTY_DISTRICT_JUDGE'
            },
            judicialMember: {
              cpUserId: null,
              id: 'id',
              seqId: 1,
              emailAddress: 'email@address.com',
              surname: 'surname',
              forenames: 'forname name',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid'
            }
          },
          {
            judicialId: '66e194e8-c194-34d9-a27b-b41c8cae9aaa',
            judicialRoleType: {
              judiciaryType: 'RECORDER'
            },
            judicialMember: {
              cpUserId: null,
              id: 'id2',
              seqId: 2,
              emailAddress: 'email2@address.com',
              surname: 'RecorderSurname',
              forenames: 'RecorderForename',
              judiciaryType: 'Recorder'
            }
          }
        ];

        const response$ = cold('(a|)', { a: null });
        const expected$ = response$;

        addBulkPermissions.and.returnValue(response$);

        const command$ = service.grantBulkJudiciaryPermission([hearingMock], judiciariesMock);

        expect(command$).toBeObservable(expected$);
        expect(addBulkPermissions).not.toHaveBeenCalled();
      });
      it('it should grant permissions if is any judiciary is selected for case', () => {
        const hearingMock: Hearing = {
          ...hearing,
          listedCases: [
            { id: permissions.permissions[0].target } as ListedCase,
            { id: permissions.permissions[2].target } as ListedCase
          ]
        };

        const judiciariesMock: ExtendedJudicialRole[] = [
          {
            judicialId: '35d194e8-c194-34d9-a27b-b41c8cae904e',
            judicialRoleType: {
              judiciaryType: 'DEPUTY_DISTRICT_JUDGE'
            },
            judicialMember: {
              cpUserId: permissions.permissions[0].source,
              id: 'id',
              seqId: 1,
              emailAddress: 'email@address.com',
              surname: 'surname',
              forenames: 'forname name',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid'
            }
          },
          {
            judicialId: '66e194e8-c194-34d9-a27b-b41c8cae9aaa',
            judicialRoleType: {
              judiciaryType: 'RECORDER'
            },
            judicialMember: {
              cpUserId: permissions.permissions[2].source,
              id: 'id2',
              seqId: 2,
              emailAddress: 'email2@address.com',
              surname: 'RecorderSurname',
              forenames: 'RecorderForename',
              judiciaryType: 'Recorder'
            }
          }
        ];

        const response$ = cold('-(a|)', { a: null });
        const expected$ = response$;

        const permissionPayload: AddPermissionPayload[] = [
          {
            source: permissions.permissions[0].source,
            target: permissions.permissions[0].target,
            object: 'Case',
            action: 'Access',
            description: `Permission for DEPUTY_DISTRICT_JUDGE:forname name surname CaseId:${permissions.permissions[0].target} for case access`,
            active: true,
            id: 'mock-uuid'
          },
          {
            source: permissions.permissions[2].source,
            target: permissions.permissions[0].target,
            object: 'Case',
            action: 'Access',
            description: `Permission for RECORDER:RecorderForename RecorderSurname CaseId:${permissions.permissions[0].target} for case access`,
            active: true,
            id: 'mock-uuid'
          },
          {
            source: permissions.permissions[0].source,
            target: permissions.permissions[2].target,
            object: 'Case',
            action: 'Access',
            description: `Permission for DEPUTY_DISTRICT_JUDGE:forname name surname CaseId:${permissions.permissions[2].target} for case access`,
            active: true,
            id: 'mock-uuid'
          },
          {
            source: permissions.permissions[2].source,
            target: permissions.permissions[2].target,
            object: 'Case',
            action: 'Access',
            description: `Permission for RECORDER:RecorderForename RecorderSurname CaseId:${permissions.permissions[2].target} for case access`,
            active: true,
            id: 'mock-uuid'
          }
        ];

        addBulkPermissions.and.returnValue(response$);

        const command$ = service.grantBulkJudiciaryPermission([hearingMock], judiciariesMock);

        expect(command$).toBeObservable(expected$);
        expect(addBulkPermissions).toHaveBeenCalledWith(permissionPayload);
      });

      it('it should grant permissions if is any judiciary is selected for application', () => {
        const hearingMock: Hearing = {
          ...hearing,
          courtApplications: [
            { id: permissions.permissions[0].target } as CourtApplication,
            { id: permissions.permissions[2].target } as CourtApplication
          ]
        };

        const judiciariesMock: ExtendedJudicialRole[] = [
          {
            judicialId: '35d194e8-c194-34d9-a27b-b41c8cae904e',
            judicialRoleType: {
              judiciaryType: 'DEPUTY_DISTRICT_JUDGE'
            },
            judicialMember: {
              cpUserId: permissions.permissions[0].source,
              id: 'id',
              seqId: 1,
              emailAddress: 'email@address.com',
              surname: 'surname',
              forenames: 'forname name',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid'
            }
          },
          {
            judicialId: '66e194e8-c194-34d9-a27b-b41c8cae9aaa',
            judicialRoleType: {
              judiciaryType: 'RECORDER'
            },
            judicialMember: {
              cpUserId: permissions.permissions[2].source,
              id: 'id2',
              seqId: 2,
              emailAddress: 'email2@address.com',
              surname: 'RecorderSurname',
              forenames: 'RecorderForename',
              judiciaryType: 'Recorder'
            }
          }
        ];

        const response$ = cold('-(a|)', { a: null });
        const expected$ = response$;

        const permissionPayload: AddPermissionPayload[] = [
          {
            source: permissions.permissions[0].source,
            target: permissions.permissions[0].target,
            object: 'Application',
            action: 'Access',
            description: `Permission for DEPUTY_DISTRICT_JUDGE:forname name surname ApplicationId:${permissions.permissions[0].target} for application access`,
            active: true,
            id: 'mock-uuid'
          },
          {
            source: permissions.permissions[2].source,
            target: permissions.permissions[0].target,
            object: 'Application',
            action: 'Access',
            description: `Permission for RECORDER:RecorderForename RecorderSurname ApplicationId:${permissions.permissions[0].target} for application access`,
            active: true,
            id: 'mock-uuid'
          },
          {
            source: permissions.permissions[0].source,
            target: permissions.permissions[2].target,
            object: 'Application',
            action: 'Access',
            description: `Permission for DEPUTY_DISTRICT_JUDGE:forname name surname ApplicationId:${permissions.permissions[2].target} for application access`,
            active: true,
            id: 'mock-uuid'
          },
          {
            source: permissions.permissions[2].source,
            target: permissions.permissions[2].target,
            object: 'Application',
            action: 'Access',
            description: `Permission for RECORDER:RecorderForename RecorderSurname ApplicationId:${permissions.permissions[2].target} for application access`,
            active: true,
            id: 'mock-uuid'
          }
        ];

        addBulkPermissions.and.returnValue(response$);

        const command$ = service.grantBulkJudiciaryPermission([hearingMock], judiciariesMock);

        expect(command$).toBeObservable(expected$);
        expect(addBulkPermissions).toHaveBeenCalledWith(permissionPayload);
      });
    });

    describe('#revokeBulkJudiciaryPermission', () => {
      it('it should revoke permissions if is any judiciary is removed from case', () => {
        const hearingWithJudiciary: Hearing = {
          ...hearing,
          listedCases: [
            { id: permissions.permissions[0].target } as ListedCase,
            { id: permissions.permissions[2].target } as ListedCase
          ],
          judiciary: [
            {
              judicialId: '35d194e8-c194-34d9-a27b-b41c8cae904e',
              judicialRoleType: {
                judiciaryType: 'DEPUTY_DISTRICT_JUDGE'
              },
              judicialMember: {
                cpUserId: permissions.permissions[0].source,
                id: 'id',
                seqId: 1,
                emailAddress: 'email@address.com',
                surname: 'surname',
                forenames: 'forname name',
                judiciaryType: 'Deputy District Judge (MC)- Fee paid'
              }
            },
            {
              judicialId: '66e194e8-c194-34d9-a27b-b41c8cae9aaa',
              judicialRoleType: {
                judiciaryType: 'RECORDER'
              },
              judicialMember: {
                cpUserId: permissions.permissions[2].source,
                id: 'id2',
                seqId: 2,
                emailAddress: 'email2@address.com',
                surname: 'RecorderSurname',
                forenames: 'RecorderForename',
                judiciaryType: 'Recorder'
              }
            }
          ]
        };

        const response$ = cold('-(a|)', { a: null });
        const permissionsResponse$ = cold('-(b|)', { b: permissions.permissions });
        const expected$ = cold('--(c|)', { c: null });

        revokeUserPermissions.and.returnValue(response$);
        getPermissionsBy.and.callFake(function () {
          if (arguments[0].object === 'Case') {
            return permissionsResponse$;
          }

          if (arguments[0].object === 'Application') {
            return of([]);
          }
        });

        const command$ = service.revokeBulkJudiciaryPermission([hearingWithJudiciary]);

        expect(command$).toBeObservable(expected$);
        expect(revokeUserPermissions).toHaveBeenCalledWith(
          permissions.permissions[0].permissionId,
          permissions.permissions[2].permissionId
        );
      });

      it('it should revoke permissions if is any judiciary is removed from application', () => {
        const hearingWithJudiciary: Hearing = {
          ...hearing,
          courtApplications: [
            { id: permissions.permissions[0].target } as CourtApplication,
            { id: permissions.permissions[2].target } as CourtApplication
          ],
          judiciary: [
            {
              judicialId: '35d194e8-c194-34d9-a27b-b41c8cae904e',
              judicialRoleType: {
                judiciaryType: 'DEPUTY_DISTRICT_JUDGE'
              },
              judicialMember: {
                cpUserId: permissions.permissions[0].source,
                id: 'id',
                seqId: 1,
                emailAddress: 'email@address.com',
                surname: 'surname',
                forenames: 'forname name',
                judiciaryType: 'Deputy District Judge (MC)- Fee paid'
              }
            },
            {
              judicialId: '66e194e8-c194-34d9-a27b-b41c8cae9aaa',
              judicialRoleType: {
                judiciaryType: 'RECORDER'
              },
              judicialMember: {
                cpUserId: permissions.permissions[2].source,
                id: 'id2',
                seqId: 2,
                emailAddress: 'email2@address.com',
                surname: 'RecorderSurname',
                forenames: 'RecorderForename',
                judiciaryType: 'Recorder'
              }
            }
          ]
        };

        const response$ = cold('-(a|)', { a: null });
        const permissionsResponse$ = cold('-(b|)', { b: permissions.applicationPermissions });
        const expected$ = cold('--(c|)', { c: null });

        revokeUserPermissions.and.returnValue(response$);
        getPermissionsBy.and.callFake(function () {
          if (arguments[0].object === 'Case') {
            return of([]);
          }

          if (arguments[0].object === 'Application') {
            return permissionsResponse$;
          }
        });

        const command$ = service.revokeBulkJudiciaryPermission([hearingWithJudiciary]);

        expect(command$).toBeObservable(expected$);
        expect(revokeUserPermissions).toHaveBeenCalledWith(
          permissions.applicationPermissions[0].permissionId
        );
      });

      it('it should revoke multiple permissions if is any judiciary is removed from multiple case', () => {
        const hearingWithJudiciary: Hearing = {
          ...hearing,
          listedCases: [
            { id: permissions.permissions[0].target } as ListedCase,
            { id: permissions.permissions[1].target } as ListedCase,
            { id: permissions.permissions[2].target } as ListedCase
          ],
          judiciary: [
            {
              judicialId: '35d194e8-c194-34d9-a27b-b41c8cae904e',
              judicialRoleType: {
                judiciaryType: 'DEPUTY_DISTRICT_JUDGE'
              },
              judicialMember: {
                cpUserId: permissions.permissions[0].source,
                id: 'id',
                seqId: 1,
                emailAddress: 'email@address.com',
                surname: 'surname',
                forenames: 'forname name',
                judiciaryType: 'Deputy District Judge (MC)- Fee paid'
              }
            },
            {
              judicialId: '66e194e8-c194-34d9-a27b-b41c8cae9aaa',
              judicialRoleType: {
                judiciaryType: 'RECORDER'
              },
              judicialMember: {
                cpUserId: permissions.permissions[2].source,
                id: 'id2',
                seqId: 2,
                emailAddress: 'email2@address.com',
                surname: 'RecorderSurname',
                forenames: 'RecorderForename',
                judiciaryType: 'Deputy District Judge (MC)- Fee paid'
              }
            }
          ]
        };

        const response$ = cold('-(a|)', { a: null });
        const permissionsResponse$ = cold('-(b|)', { b: permissions.permissions });
        const expected$ = cold('--(c|)', { c: null });

        revokeUserPermissions.and.returnValue(response$);
        getPermissionsBy.and.callFake(function () {
          if (arguments[0].object === 'Case') {
            return permissionsResponse$;
          }

          if (arguments[0].object === 'Application') {
            return of([]);
          }
        });

        const command$ = service.revokeBulkJudiciaryPermission([hearingWithJudiciary]);

        expect(command$).toBeObservable(expected$);
        expect(revokeUserPermissions).toHaveBeenCalledWith(
          permissions.permissions[0].permissionId,
          permissions.permissions[1].permissionId,
          permissions.permissions[2].permissionId
        );
      });
    });

    describe('#sendEmailNotification', () => {
      it('it should send 2 notifications with proper data', () => {
        const response$ = cold('-(a|)', { a: null });
        const expected$ = cold('-(bc|)', { b: null, c: null });

        getNotificationEmailTemplateId.and.returnValue('notification-template-id');
        getUsersByPlacementAndRole.and.returnValue(
          of([{ email: 'judicialcontactcrime@justice.gov.uk' }])
        );
        http.command = jasmine.createSpy('sendEmailNotification').and.returnValue(response$);
        const command$ = service.sendEmailNotification(
          [HearingWithCourtCentre],
          [extendedJudiciaryMember4],
          extendedJudiciaryMember4.judicialRoleType.judiciaryType as JudiciaryTypesGroups
        );

        expect(command$).toBeObservable(expected$);
        expect(http.command).toHaveBeenCalledTimes(2);
        expect(http.command).toHaveBeenNthCalledWith(1, {
          url: `/notificationnotify-command-api/command/api/rest/notificationnotify/notifications/mock-uuid`,
          requestType: 'application/vnd.notificationnotify.email+json',
          body: {
            templateId: 'notification-template-id',
            sendToAddress: extendedJudiciaryMember4.judicialMember.emailAddress,
            personalisation: {
              courtHouse: HearingWithCourtCentre.selectedCourtCentre.courtCentreName,
              hearingDate: moment(HearingWithCourtCentre.hearingDays[0].startTime).format(
                'DD/MM/YYYY'
              ),
              timeOfSitting: moment(HearingWithCourtCentre.hearingDays[0].startTime).format(
                'HH:mm'
              ),
              listOfUrns: HearingWithCourtCentre.listedCases
                .map(listedCase => listedCase.caseIdentifier.caseReference)
                .join(',')
            }
          }
        });

        expect(http.command).toHaveBeenNthCalledWith(2, {
          url: `/notificationnotify-command-api/command/api/rest/notificationnotify/notifications/mock-uuid`,
          requestType: 'application/vnd.notificationnotify.email+json',
          body: {
            templateId: 'notification-template-id',
            sendToAddress: 'judicialcontactcrime@justice.gov.uk',
            personalisation: {
              courtHouse: HearingWithCourtCentre.selectedCourtCentre.courtCentreName,
              hearingDate: moment(HearingWithCourtCentre.hearingDays[0].startTime).format(
                'DD/MM/YYYY'
              ),
              timeOfSitting: moment(HearingWithCourtCentre.hearingDays[0].startTime).format(
                'HH:mm'
              ),
              listOfUrns: HearingWithCourtCentre.listedCases
                .map(listedCase => listedCase.caseIdentifier.caseReference)
                .join(',')
            }
          }
        });
      });

      it('it should send notifications for applications', () => {
        const hearingWithApplication = {
          ...HearingWithCourtCentre,
          listedCases: undefined,
          courtApplications: [{ applicationReference: 'app-ref' } as CourtApplication]
        };

        const response$ = cold('-(a|)', { a: null });
        const expected$ = cold('-(bc|)', { b: null, c: null });

        getNotificationEmailTemplateId.and.returnValue('notification-template-id');
        getUsersByPlacementAndRole.and.returnValue(
          of([{ email: 'judicialcontactcrime@justice.gov.uk' }])
        );
        http.command = jasmine.createSpy('sendEmailNotification').and.returnValue(response$);
        const command$ = service.sendEmailNotification(
          [hearingWithApplication],
          [extendedJudiciaryMember4],
          extendedJudiciaryMember4.judicialRoleType.judiciaryType as JudiciaryTypesGroups
        );

        expect(command$).toBeObservable(expected$);
        expect(http.command).toHaveBeenCalledTimes(2);
        expect(http.command).toHaveBeenNthCalledWith(1, {
          url: `/notificationnotify-command-api/command/api/rest/notificationnotify/notifications/mock-uuid`,
          requestType: 'application/vnd.notificationnotify.email+json',
          body: {
            templateId: 'notification-template-id',
            sendToAddress: extendedJudiciaryMember4.judicialMember.emailAddress,
            personalisation: {
              courtHouse: HearingWithCourtCentre.selectedCourtCentre.courtCentreName,
              hearingDate: moment(HearingWithCourtCentre.hearingDays[0].startTime).format(
                'DD/MM/YYYY'
              ),
              timeOfSitting: moment(HearingWithCourtCentre.hearingDays[0].startTime).format(
                'HH:mm'
              ),
              listOfUrns: hearingWithApplication.courtApplications
                .map(application => application.applicationReference)
                .join(',')
            }
          }
        });

        expect(http.command).toHaveBeenNthCalledWith(2, {
          url: `/notificationnotify-command-api/command/api/rest/notificationnotify/notifications/mock-uuid`,
          requestType: 'application/vnd.notificationnotify.email+json',
          body: {
            templateId: 'notification-template-id',
            sendToAddress: 'judicialcontactcrime@justice.gov.uk',
            personalisation: {
              courtHouse: HearingWithCourtCentre.selectedCourtCentre.courtCentreName,
              hearingDate: moment(HearingWithCourtCentre.hearingDays[0].startTime).format(
                'DD/MM/YYYY'
              ),
              timeOfSitting: moment(HearingWithCourtCentre.hearingDays[0].startTime).format(
                'HH:mm'
              ),
              listOfUrns: hearingWithApplication.courtApplications
                .map(application => application.applicationReference)
                .join(',')
            }
          }
        });
      });

      it('it should not send any email if there is no DDJ or RECORDER selected', () => {
        const response$ = cold('-a|', { a: null });
        const expected$ = cold('(b|)', { b: null });

        getNotificationEmailTemplateId.and.returnValue('notification-template-id');
        getUsersByPlacementAndRole.and.returnValue(of([]));
        http.command = jasmine.createSpy('sendEmailNotification').and.returnValue(response$);
        const command$ = service.sendEmailNotification(
          [HearingWithCourtCentre],
          [extendedJudiciaryMember2],
          JudiciaryTypesGroups.RECORDER
        );

        expect(command$).toBeObservable(expected$);
        expect(http.command).not.toHaveBeenCalled();
      });
    });

    it('#extendHearingForHearing', () => {
      const selectedHearingId = 'test-selected-hearing-id';
      const allocatedHearingId = 'test-allocated-hearing-id';
      const allocatedHearing = true;
      const prosecutionCases = [];
      const sendNotificationToParties = true;

      const response = { body: '*' };
      const response$ = cold('-a|', { a: response });
      const expected$ = cold('-b|', { b: response });

      http.commandSync = jasmine.createSpy('extendHearingForHearing').and.returnValue(response$);

      const command$ = service.extendHearingForHearing(
        selectedHearingId,
        allocatedHearingId,
        allocatedHearing,
        sendNotificationToParties,
        prosecutionCases
      );

      expect(command$).toBeObservable(expected$);
      expect(http.commandSync).toHaveBeenCalledWith({
        url: `/listing-command-api/command/api/rest/listing/hearings/${selectedHearingId}`,
        requestType: 'application/vnd.listing.command.extend-hearing-for-hearing+json',
        successEvent: 'public.progression.events.hearing-extended',
        body: { allocatedHearingId, prosecutionCases, sendNotificationToParties }
      });
    });

    it('#sequenceHearings', () => {
      const expectedBody = sequenceHearingsCommand;

      const response = { body: '*' };
      const response$ = cold('-a|', { a: response });
      const expected$ = cold('-b|', { b: response });

      http.command = jasmine.createSpy('sequenceHearings').and.returnValue(response$);

      const command$ = service.sequenceHearings(sequencedHearings);

      expect(command$).toBeObservable(expected$);

      expect(http.command).toHaveBeenCalledWith({
        url: `/listing-command-api/command/api/rest/listing/hearings/sequence`,
        requestType: 'application/vnd.listing.command.sequence-hearings+json',
        body: expectedBody
      });
    });

    it('#changeJudiciaryForHearings', () => {
      const expectedBody = judiciaryForHearings;

      const response = { body: '*' };
      const response$ = cold('-a|', { a: response });
      const expected$ = cold('-b|', { b: response });

      http.commandSync = jasmine.createSpy('changeJudiciaryForHearings').and.returnValue(response$);

      const command$ = service.changeJudiciaryForHearings(judiciaryForHearings);

      expect(command$).toBeObservable(expected$);

      expect(http.commandSync).toHaveBeenCalledWith({
        url: `/listing-command-api/command/api/rest/listing/hearings`,
        requestType: 'application/vnd.listing.command.change-judiciary-for-hearings+json',
        successEvent: 'public.listing.judiciary-changed-for-hearings-status',
        body: expectedBody
      });
    });

    describe('downloadCourtList', () => {
      it('should download PUBLIC court list document', () => {
        const params = toHttpParams(mockFilterOptionsForDownloadList);
        const httpResponse$ = cold('-a|', { a: 'textstream' });
        const expected$ = cold('-b|', {
          b: new Blob(['textstream'], { type: 'application/pdf' })
        });

        http.query = jasmine.createSpy().and.returnValue(httpResponse$);
        const query$ = service.downloadCourtList(mockFilterOptionsForDownloadList);

        expect(query$).toBeObservable(expected$);

        expect(http.query).toHaveBeenCalledWith({
          url: '/courtlistpublishing-service/api/court-list-publish/download',
          requestType: 'application/vnd.courtlistpublishing-service.download.get+json',
          responseType: 'blob',
          params
        });
      });

      it('should download Magistrate Ushers court list document', () => {
        const params = toHttpParams(mockFilterOptionsForDownloadList);
        const httpResponse$ = cold('-a|', { a: 'textstream' });
        const expected$ = cold('-b|', {
          b: new Blob(['textstream'], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          })
        });

        http.query = jasmine.createSpy().and.returnValue(httpResponse$);
        const query$ = service.downloadCourtList(mockFilterOptionsForDownloadList);

        expect(query$).toBeObservable(expected$);

        expect(http.query).toHaveBeenCalledWith({
          url: '/courtlistpublishing-service/api/court-list-publish/download',
          requestType: 'application/vnd.courtlistpublishing-service.download.get+json',
          responseType: 'blob',
          params
        });
      });

      it('should download Crown Ushers court list document', () => {
        const params = toHttpParams(mockFilterOptionsForDownloadList);
        const httpResponse$ = cold('-a|', { a: 'textstream' });
        const expected$ = cold('-b|', {
          b: new Blob(['textstream'], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          })
        });

        http.query = jasmine.createSpy().and.returnValue(httpResponse$);
        const query$ = service.downloadCourtList(mockFilterOptionsForDownloadList);

        expect(query$).toBeObservable(expected$);

        expect(http.query).toHaveBeenCalledWith({
          url: '/courtlistpublishing-service/api/court-list-publish/download',
          requestType: 'application/vnd.courtlistpublishing-service.download.get+json',
          responseType: 'blob',
          params
        });
      });

      it('should download ALPHABETICAL court list document', () => {
        const options = {
          ...mockFilterOptionsForDownloadList,
          courtListType: CourtListType.ALPHABETICAL
        };
        const params = toHttpParams(options);

        const httpResponse$ = cold('-a|', { a: 'textstream' });
        const expected$ = cold('-b|', {
          b: new Blob(['textstream'], { type: 'application/pdf' })
        });

        http.query = jasmine.createSpy().and.returnValue(httpResponse$);
        const query$ = service.downloadCourtList(options);

        expect(query$).toBeObservable(expected$);

        expect(http.query).toHaveBeenCalledWith({
          url: '/courtlistpublishing-service/api/court-list-publish/download',
          requestType: 'application/vnd.courtlistpublishing-service.download.get+json',
          responseType: 'blob',
          params
        });
      });
    });

    it('updateCourtRestrictionsSync Should update the appropriate entity with a restriction', () => {
      const response = { body: '*' };
      const response$ = cold('-a|', { a: response });
      const expected$ = cold('-b|', { b: response });

      http.commandSync = jasmine
        .createSpy('updateCourtRestrictionsSync')
        .and.returnValue(response$);
      const restriction = {
        offenceIds: ['1234'],
        hearingId: '123456',
        restrictCourtList: true
      };
      const command$ = service.updateCourtRestrictionsSync(restriction);
      expect(command$).toBeObservable(expected$);

      expect(http.commandSync).toHaveBeenCalledWith({
        url: '/listing-command-api/command/api/rest/listing/hearings',
        requestType: 'application/vnd.listing.command.restrict-court-list+json',
        body: restriction,
        successEvent: 'public.listing.court-list-restricted'
      });
    });

    describe('Download Prison List', () => {
      it('should download Prison list document', () => {
        const params = toHttpParams(mockFilterOptionsForDownloadPrisonList);
        const httpResponse$ = cold('-a|', { a: 'textstream' });
        const expected$ = cold('-b|', {
          b: new Blob(['textstream'], { type: 'application/pdf' })
        });

        http.query = jasmine.createSpy().and.returnValue(httpResponse$);
        const query$ = service.downloadPrisonList(mockFilterOptionsForDownloadPrisonList);

        expect(query$).toBeObservable(expected$);

        expect(http.query).toHaveBeenCalledWith({
          url: '/progression-query-api/query/api/rest/progression/courtlist',
          requestType: 'application/vnd.progression.search.prison.court.list+json',
          responseType: 'blob',
          params
        });
      });
    });
  });
});
