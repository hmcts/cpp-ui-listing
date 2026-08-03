import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CppHttp } from '@cpp/core';
import cleanDeep from 'clean-deep';
import { forkJoin, merge, Observable, of } from 'rxjs';
import { map, switchMap, take, tap, defaultIfEmpty } from 'rxjs/operators';
import moment from 'moment';
import uuid from 'uuid/v4';
import {
  CourtRestriction,
  Hearing,
  HearingWithSelectedCourtCentre,
  JudicialRole,
  JudiciaryForHearings,
  Offence,
  SearchAvailableHearingsFormOptions,
  SelectedFilterOptions,
  SequenceHearing
} from '../../model';
import {
  PublishStatus,
  JurisdictionType,
  ExtendedJudicialRole,
  PaginatedHearingResponse,
  PanelType
} from '../../model/hearing';
import { TypeOfListSummary } from '../../../unscheduled-listings/unscheduled-listings.interfaces';
import { CaseNote } from '../../../allocate-hearing/allocate-hearing.interfaces';
import { AppConfigService } from '../../../config/config.service';

import { cloneDeep, uniq, uniqBy } from 'lodash-es';

import { AddPermissionPayload, RolePermission, UsersGroupsService } from '@cpp/users-groups';
import { AppState } from '../../reducers';
import { Store } from '@ngrx/store';
import { getCourtCentres } from '../../selectors';
import { JudiciaryTypesGroups } from '@cpp/reference-data';
import { HearingAllocationPayload, RemoveHearingPayload } from '../../../court-calendar/model';
import { HttpBackgroundQueryOptions } from '../../http/http-service';
import { ListingNote } from '@cpp/scheduling';
import { CPPDate } from '../../util';
import { DownloadListRequest } from '../../../create-a-list/models/mags-publish-list.dto';

@Injectable()
export class ListingService {
  private readonly cppDate = inject(CPPDate);
  private PUBLISH_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';
  private ALL_PUBLISH_LISTS = 'FIRM,WARN,DRAFT,FINAL';
  private TYPE_OF_LIST_OPTIONS: TypeOfListSummary[] = [
    {
      value: 'c98cb51f-8639-49c1-91f0-a7e820c34355',
      label: 'Warrant for arrest without bail'
    },
    {
      value: '671df737-9901-4fa5-b245-aeff0c4c7495',
      label: 'Warrant for arrest with bail (undated)'
    },
    {
      value: 'ed34136f-2a13-45a4-8d4f-27075ae3a8a9',
      label: 'Warrant for arrest for community penalty without bail'
    },
    {
      value: '0d1b161b-d6b0-4b1b-ae08-535864e4f631',
      label: 'Warrant for arrest for community penalty with bail (undated)'
    },
    {
      value: 'e8a046a9-6970-4bd3-a0bf-9cece0aefce2',
      label: 'Adjourned Sine Die'
    },
    {
      value: 'fbed768b-ee95-4434-87c8-e81cbc8d24c8',
      label: 'Date and time to be fixed'
    }
  ];

  constructor(
    private api: CppHttp,
    private appConfig: AppConfigService,
    private userGroupService: UsersGroupsService,
    private store: Store<AppState>
  ) {}

  fetchHearingById(hearingId: string): Observable<Hearing> {
    return this.api.query<Hearing>({
      url: `/listing-query-api/query/api/rest/listing/hearings/${hearingId}`,
      requestType: 'application/vnd.listing.search.hearing+json'
    });
  }

  //legacy fetch
  getUnallocatedHearings(options: SelectedFilterOptions): Observable<PaginatedHearingResponse> {
    return this.searchHearings(options, false);
  }

  //legacy fetch
  getAllocatedHearings(options: SelectedFilterOptions): Observable<PaginatedHearingResponse> {
    return this.searchHearings(options, true);
  }

  getUnscheduledHearings(options: SelectedFilterOptions): Observable<PaginatedHearingResponse> {
    return this.searchUnscheduledHearings(options);
  }

  // GPE-14165: This data is hardcoded as, in the future, it may be an endpoint to return the data below
  getTypeOfList(): Observable<TypeOfListSummary[]> {
    return of(this.TYPE_OF_LIST_OPTIONS);
  }

  searchCourtCalendarHearings(
    options: SelectedFilterOptions
  ): Observable<PaginatedHearingResponse> {
    const params = this.toHttpParams(options);
    return this.api
      .query<{ hearings: Hearing[] }>({
        url: '/listing-query-api/query/api/rest/listing/hearings/range-search',
        requestType: 'application/vnd.listing.search.hearings.court.calendar+json',
        params
      })
      .pipe(
        map(({ hearings: h, ...rest }: PaginatedHearingResponse) => {
          const hearings: Hearing[] = h.map((hearing, index) => {
            if (!hearing.weekCommencingStartDate) {
              return hearing;
            }
            return this.mapWeekEndingPropertiesWithDefaults(hearing, index);
          });
          return {
            ...rest,
            hearings
          };
        })
      );
  }

  allocateHearing(
    {
      hearingId,
      judiciary,
      prosecutionCases = [],
      ...body
    }: {
      courtCentreId: string;
      courtRoomId: string;
      endDate?: string;
      hearingId: string;
      hearingLanguage: Hearing['hearingLanguage'];
      judiciary?: ExtendedJudicialRole[];
      jurisdictionType: JurisdictionType;
      nonDefaultDays: Required<Hearing['nonDefaultDays']>;
      nonSittingDays: Hearing['nonSittingDays'];
      prosecutionCases?: {
        caseId: string;
        defendants: {
          defendantId: string;
          offences: { offenceId: string }[];
        }[];
      }[];
      startDate?: string;
      publicListNote?: string;
      hasVideoLink?: boolean;
      panel?: PanelType;
      weekCommencingStartDate?: string;
      weekCommencingEndDate?: string;
      weekCommencingDurationInWeeks?: number;
      type: Hearing['type'];
      bookingType?: string;
      priority?: string;
      specialRequirements?: string[];
      sendNotificationToParties?: boolean;
    },
    splitHearingUnallocated = false
  ): Observable<unknown> {
    return this.api.commandSync({
      url: `/listing-command-api/command/api/rest/listing/hearings/${hearingId}`,
      requestType: 'application/vnd.listing.command.update-hearing-for-listing+json',
      successEvent: 'public.listing.hearing-changes-saved',
      body: splitHearingUnallocated
        ? {
            ...body,
            judiciary: judiciary ? judiciary.map(({ judicialMember, ...rest }) => rest) : undefined,
            prosecutionCases: prosecutionCases.length ? prosecutionCases : undefined,
            splitHearing: 'unallocated'
          }
        : {
            ...body,
            judiciary: judiciary ? judiciary.map(({ judicialMember, ...rest }) => rest) : undefined,
            prosecutionCases: prosecutionCases.length ? prosecutionCases : undefined
          }
    });
  }

  updateUnallocatedHearing(
    hearing: Hearing,
    prosecutionCases: {
      caseId: string;
      defendants: {
        defendantId: string;
        offences: { offenceId: string }[];
      }[];
    }[] = [],
    splitHearingUnallocated = false
  ): Observable<unknown> {
    const { publicListNote = '', hasVideoLink = false } = hearing;
    const body: Record<string, unknown> & { splitHearing?: string } = {
      courtCentreId: hearing.courtCentreId,
      type: hearing.type,
      nonSittingDays: hearing.nonSittingDays,
      nonDefaultDays: hearing.nonDefaultDays,
      judiciary: hearing.judiciary
        ? hearing.judiciary.map(
            ({ judicialId, ...judge }) =>
              ({
                judicialId: judicialId || judge.judicialMember.id,
                judicialRoleType: judge.judicialRoleType,
                isDeputy: judge.isDeputy,
                isBenchChairman: judge.isBenchChairman
              }) as JudicialRole
          )
        : undefined,
      jurisdictionType: hearing.jurisdictionType,
      hearingLanguage: hearing.hearingLanguage,
      prosecutionCases: prosecutionCases.length ? prosecutionCases : undefined,
      publicListNote,
      hasVideoLink,
      bookingType: hearing.bookingType,
      priority: hearing.priority,
      specialRequirements: hearing.specialRequirements,
      sendNotificationToParties: hearing.sendNotificationToParties
    };
    if (splitHearingUnallocated) {
      body.splitHearing = 'unallocated';
    }
    if (hearing.weekCommencingStartDate) {
      body.weekCommencingStartDate = hearing.weekCommencingStartDate;
      body.weekCommencingEndDate = hearing.weekCommencingEndDate;
      body.weekCommencingDurationInWeeks = +hearing.weekCommencingDurationInWeeks;
    } else {
      body.startDate = hearing.startDate;
      body.endDate = hearing.endDate;
    }

    return this.api.commandSync({
      url: `/listing-command-api/command/api/rest/listing/hearings/${hearing.id}`,
      requestType: 'application/vnd.listing.command.update-hearing-for-listing+json',
      successEvent: 'public.listing.hearing-days-changed-for-hearing',
      body
    });
  }

  updateAllocatedHearing(hearing: HearingWithSelectedCourtCentre): Observable<any> {
    const { publicListNote = '', hasVideoLink = false } = hearing;
    const nonDefaultDays = cloneDeep(hearing.nonDefaultDays);

    nonDefaultDays.forEach(nonDefaultDay => (nonDefaultDay.duration = nonDefaultDay.duration || 0));

    return this.api.commandSync({
      url: `/listing-command-api/command/api/rest/listing/hearings/${hearing.id}`,
      requestType: 'application/vnd.listing.command.update-hearing-for-listing+json',
      successEvent: 'public.listing.hearing-updated',
      body: {
        selectedCourtCentre: hearing.selectedCourtCentre,
        courtCentreId: hearing.courtCentreId,
        courtRoomId: hearing.courtRoomId === 'NONE' ? undefined : hearing.courtRoomId,
        type: hearing.type,
        startDate: hearing.startDate,
        endDate: hearing.endDate,
        nonSittingDays: hearing.nonSittingDays,
        nonDefaultDays: nonDefaultDays,
        judiciary: hearing.judiciary
          ? hearing.judiciary
              .filter(judic => !!judic) // this is to remove gaps in magistrates (eg Winger 2 present but not Winger 1, etc)
              .map(
                ({ judicialId, ...judge }) =>
                  ({
                    judicialId: judicialId || judge.judicialMember.id,
                    judicialRoleType: judge.judicialRoleType,
                    isDeputy: judge.isDeputy,
                    isBenchChairman: judge.isBenchChairman
                  }) as JudicialRole
              )
          : undefined,
        jurisdictionType: hearing.jurisdictionType,
        hearingLanguage: hearing.hearingLanguage,
        publicListNote,
        hasVideoLink,
        sendNotificationToParties: hearing.sendNotificationToParties
      }
    });
  }

  grantBulkJudiciaryPermission(
    hearings: Hearing[],
    judiciaries: ExtendedJudicialRole[],
    judiciaryType?: JudiciaryTypesGroups
  ): Observable<unknown> {
    const permissions: AddPermissionPayload[] = [];
    const selectedJudiciaries = judiciaries.filter(
      judiciary =>
        (judiciaryType
          ? judiciary.judicialRoleType.judiciaryType === judiciaryType
          : judiciary.judicialRoleType.judiciaryType ===
              JudiciaryTypesGroups.DEPUTY_DISTRICT_JUDGE ||
            judiciary.judicialRoleType.judiciaryType === JudiciaryTypesGroups.RECORDER) &&
        judiciary.judicialMember.cpUserId
    );

    if (!selectedJudiciaries.length) {
      return of(null);
    }

    hearings.forEach(hearing => {
      (hearing.listedCases || []).forEach(value => {
        selectedJudiciaries.forEach(judiciary => {
          permissions.push({
            source: judiciary.judicialMember.cpUserId,
            target: value.id,
            object: 'Case',
            action: 'Access',
            description: `Permission for ${judiciary.judicialRoleType.judiciaryType}:${judiciary.judicialMember.forenames} ${judiciary.judicialMember.surname} CaseId:${value.id} for case access`,
            active: true,
            id: uuid()
          });
        });
      });

      if (!hearing.listedCases || !hearing.listedCases.length) {
        (hearing.courtApplications || []).forEach(value => {
          selectedJudiciaries.forEach(judiciary => {
            permissions.push({
              source: judiciary.judicialMember.cpUserId,
              target: value.id,
              object: 'Application',
              action: 'Access',
              description: `Permission for ${judiciary.judicialRoleType.judiciaryType}:${judiciary.judicialMember.forenames} ${judiciary.judicialMember.surname} ApplicationId:${value.id} for application access`,
              active: true,
              id: uuid()
            });
          });
        });
      }
    });
    return this.userGroupService.addBulkPermissions(permissions);
  }

  revokeBulkJudiciaryPermission(
    hearings: Hearing[],
    judiciaryType?: JudiciaryTypesGroups
  ): Observable<unknown> {
    let getJudiciaryPermissions$: Observable<RolePermission[]>[] = [];
    const permissionsRequiredData = this.getDataForPermissionRevoke(hearings, judiciaryType);
    getJudiciaryPermissions$ = (permissionsRequiredData.judiciaries ?? []).map(judiciaries => {
      const { cpUserId: source } = judiciaries.judicialMember;
      return forkJoin([
        this.userGroupService.getPermissionsBy({
          object: 'Case',
          action: 'Access',
          source
        }),
        this.userGroupService.getPermissionsBy({
          object: 'Application',
          action: 'Access',
          source
        })
      ]).pipe(map(val => [...val[0], ...val[1]]));
    });

    return forkJoin(getJudiciaryPermissions$).pipe(
      defaultIfEmpty([]),
      switchMap(permissions2DArray => {
        const { listedCaseIds = [], listedApplicationIds = [] } = permissionsRequiredData;
        const permissionIds = permissions2DArray
          .map(permissions =>
            permissions.filter(
              ({ target }) =>
                listedCaseIds.indexOf(target) > -1 || listedApplicationIds.indexOf(target) > -1
            )
          )
          .reduce((mappedIds, permissions) => {
            const ids = permissions.map(permission => permission.permissionId);
            return uniq(mappedIds.concat(ids));
          }, [] as string[]);
        if (permissionIds.length === 0) {
          return of(null);
        }
        return this.userGroupService.revokeUserPermissions(...permissionIds);
      })
    );
  }

  sendEmailNotification(
    originHearings: HearingWithSelectedCourtCentre[],
    judiciaries: ExtendedJudicialRole[],
    judiciaryType: JudiciaryTypesGroups
  ) {
    const selectedJudiciary = judiciaries.find(
      judi => judi.judicialRoleType.judiciaryType === judiciaryType
    );

    if (!selectedJudiciary) {
      return of(null);
    }

    const hearing = originHearings[0];
    const listOfUrns = originHearings
      .map(originHearing => {
        if (!originHearing.listedCases || !originHearing.listedCases.length) {
          return originHearing.courtApplications.map(
            application => application.applicationReference
          );
        }

        return originHearing.listedCases.map(listedCase => listedCase.caseIdentifier.caseReference);
      })
      .join(',');

    // retrieve users in DD-13193s
    // parse the response and extract email address
    // concatenate email addresses by comma (,)
    const sendToAddresses = [];

    if (selectedJudiciary) {
      sendToAddresses.push(`${selectedJudiciary.judicialMember.emailAddress}`);
    }

    return this.store.select(getCourtCentres).pipe(
      take(1),
      map(courtCentres => courtCentres.find(cc => cc.id === hearing.selectedCourtCentre.id)),
      switchMap(courtCentre =>
        this.userGroupService.getUsersByPlacementAndRole(courtCentre.oucode, 'Listing Officer')
      ),
      tap(users => {
        if (users.length) {
          users.forEach(u => sendToAddresses.push(u.email));
        }
      }),
      switchMap(() =>
        this.sendNotificationNotifyEmail(sendToAddresses, hearing, listOfUrns, selectedJudiciary)
      )
    );
  }

  extendHearingForHearing(
    selectedHearingId: string,
    allocatedHearingId: string,
    allocatedHearing: boolean,
    sendNotificationToParties: boolean,
    prosecutionCases: {
      caseId: string;
      defendants: {
        defendantId: string;
        offences: { offenceId: string }[];
      }[];
    }[]
  ): Observable<any> {
    return this.api.commandSync({
      url: `/listing-command-api/command/api/rest/listing/hearings/${selectedHearingId}`,
      requestType: 'application/vnd.listing.command.extend-hearing-for-hearing+json',
      successEvent: allocatedHearing
        ? 'public.progression.events.hearing-extended'
        : 'public.listing.cases-added-to-hearing',
      body: {
        allocatedHearingId,
        prosecutionCases,
        sendNotificationToParties
      }
    });
  }

  /**
   * @deprecated
   * This method should be roemoved when Court calendar features are finished and released.
   * The pages that use this method will be removed then.
   * @param hearings
   */
  sequenceHearings(hearings: SequenceHearing[]): Observable<any> {
    const body = { hearings: hearings };

    return this.api
      .command({
        url: `/listing-command-api/command/api/rest/listing/hearings/sequence`,
        requestType: 'application/vnd.listing.command.sequence-hearings+json',
        body
      })
      .pipe(map(res => res));
  }

  /**
   * This is the same as @function sequencedHearings , the difference is
   * this waits for the public event. Once the court calendar features are finishe
   * we will be removing @method sequencedHearings
   * @param {Array<SequenceHearing>} hearings
   *
   */
  sequenceHearingSync(hearings: SequenceHearing[]): Observable<any> {
    const body = { hearings: hearings };

    return this.api
      .commandSync({
        url: `/listing-command-api/command/api/rest/listing/hearings/sequence`,
        requestType: 'application/vnd.listing.command.sequence-hearings+json',
        body,
        successEvent: 'public.listing.hearing-days-sequenced'
      })
      .pipe(map(res => res));
  }

  changeJudiciaryForHearings(judiciaryForHearings: JudiciaryForHearings): Observable<unknown> {
    const body = judiciaryForHearings;

    return this.api.commandSync({
      url: '/listing-command-api/command/api/rest/listing/hearings',
      requestType: 'application/vnd.listing.command.change-judiciary-for-hearings+json',
      successEvent: 'public.listing.judiciary-changed-for-hearings-status',
      body
    });
  }

  searchHearingsWithTimeRange(
    options: SelectedFilterOptions
  ): Observable<{ hearings: Hearing[]; notes: ListingNote[] }> {
    const opt = {
      ...options,
      allocated: true
    };
    const params = this.toHttpParams(opt);

    return this.api.query<{ hearings: Hearing[]; notes: ListingNote[] }>({
      url: '/listing-query-api/query/api/rest/listing/hearings/',
      requestType: 'application/vnd.listing.search.hearings+json',
      params
    });
  }

  searchAvailableHearings(
    options: SearchAvailableHearingsFormOptions
  ): Observable<{ hearings: Hearing[]; notes: ListingNote[] }> {
    const opt = {
      hearingId: options.hearingId,
      caseUrn: options.caseUrns ? options.caseUrns.join(',') : null,
      searchCriteria: options.searchCriterias ? options.searchCriterias.join(',') : null,
      returnAllHearings: !!options.returnAllHearings
    };
    const params = this.toHttpParams(opt);

    return this.api.query<{ hearings: Hearing[]; notes: ListingNote[] }>({
      url: '/listing-service/query/api/rest/listing/hearings/available-search/',
      requestType: 'application/vnd.listing.search.hearings+json',
      params
    });
  }

  downloadCourtList(options: DownloadListRequest) {
    const params = this.toHttpParams(options);
    return this.api
      .query<Blob>({
        url: '/courtlistpublishing-service/api/court-list-publish/download',
        requestType: 'application/vnd.courtlistpublishing-service.download.get+json',
        responseType: 'blob',
        params
      })
      .pipe(map(response => new Blob([response], { type: response.type })));
  }

  updateCourtRestrictionsSync(courtRestriction: CourtRestriction) {
    const body = courtRestriction;
    return this.api.commandSync({
      url: '/listing-command-api/command/api/rest/listing/hearings',
      requestType: 'application/vnd.listing.command.restrict-court-list+json',
      successEvent: 'public.listing.court-list-restricted',
      body
    });
  }

  publishCourtListStatus(publishStatus: PublishStatus): Observable<unknown> {
    const requestedTime = `${moment().utc().format(this.PUBLISH_DATE_FORMAT)}Z`;
    const body = {
      courtCentreId: publishStatus.courtCentreId,
      startDate: publishStatus.startDate,
      endDate: publishStatus.endDate,
      publishCourtListType: publishStatus.publishCourtListType,
      sendNotificationToParties: publishStatus.sendNotificationToParties,
      requestedTime
    };

    return this.api.command({
      url: `/listing-command-api/command/api/rest/listing/publishCourtList/${publishStatus.courtCentreId}`,
      requestType: 'application/vnd.listing.command.publish-court-list+json',
      body
    });
  }

  retrieveLatestCourtListStatus(
    publishStatusQuery: PublishStatus
  ): Observable<{ publishCourtListStatuses: PublishStatus }> {
    const opt = {
      publishCourtListTypes: this.ALL_PUBLISH_LISTS,
      weekCommencing: publishStatusQuery.weekCommencing,
      publishDate: publishStatusQuery.publishDate
    };
    const httpParams = this.toHttpParams(opt);
    return this.api
      .query<{ publishCourtListStatuses: any }>({
        url: `/listing-query-api/query/api/rest/listing/courtListPublishStatus/${
          publishStatusQuery.courtCentreId
        }?${httpParams.toString()}`,
        requestType: 'application/vnd.listing.court.list.publish.status+json'
      })
      .pipe(map(res => res.publishCourtListStatuses));
  }

  getCaseNotesForCases(caseIds: string[]): Observable<Record<string, CaseNote[]>> {
    return forkJoin(caseIds.map(id => this.getCaseNotes(id))).pipe(
      map(caseNotes => {
        return caseNotes.reduce((caseNotesMap, record) => ({ ...caseNotesMap, ...record }), {});
      })
    );
  }

  getCaseNotes(caseId: string, inBackground = false): Observable<Record<string, CaseNote[]>> {
    return this.api
      .query<{ caseNotes: CaseNote[] }>({
        url: `/progression-query-api/query/api/rest/progression/cases/${caseId}/notes`,
        requestType: 'application/vnd.progression.query.case-notes+json',
        background: inBackground
      } as HttpBackgroundQueryOptions)
      .pipe(
        map(result => ({
          [caseId]: result.caseNotes
        }))
      );
  }

  extractProsecutionCasesIdsFromHearing(scheduledAllocatedHearing: Hearing): {
    caseId: string;
    defendants: {
      defendantId: string;
      offences: { offenceId: string }[];
    }[];
  }[] {
    const prosecutionCasesIds = [];
    if (scheduledAllocatedHearing.listedCases && scheduledAllocatedHearing.listedCases.length) {
      scheduledAllocatedHearing.listedCases.forEach(listedCase => {
        if (listedCase.defendants.length > 0) {
          const defendants = [];
          listedCase.defendants.forEach(defendant => {
            if (defendant.offences.length > 0) {
              const offences: Pick<Offence, 'offenceId'>[] =
                defendant.offences.map(({ id }) => {
                  return { offenceId: id };
                }) || [];
              if (offences.length > 0) {
                defendants.push({
                  defendantId: defendant.id,
                  offences
                });
              }
            }
          });
          if (defendants.length > 0) {
            prosecutionCasesIds.push({
              caseId: listedCase.id,
              defendants
            });
          }
        }
      });
    }
    return prosecutionCasesIds;
  }

  downloadPrisonList(options: SelectedFilterOptions) {
    const url = '/courtlistpublishing-service/api/court-list-publish/prison/download';
    const requestType = 'application/vnd.courtlistpublishing-service.prison-download.get+json';

    const params = this.toHttpParams(options);
    return this.api
      .query<Blob>({
        url,
        requestType,
        responseType: 'blob',
        params
      })
      .pipe(map(response => new Blob([response], { type: response.type })));
  }

  removeHearing({ hearingId, reason }: RemoveHearingPayload) {
    return this.api.commandSync({
      url: `/hearing-command-api/command/api/rest/hearing/hearings/${hearingId}`,
      body: { reason },
      requestType: 'application/vnd.hearing.mark-as-duplicate-with-reason+json',
      successEvent: 'public.events.hearing.marked-as-duplicate'
    });
  }

  bulkUpdateHearings(
    hearings: HearingAllocationPayload[]
  ): Observable<{ failedHearingIds: string[] }> {
    return this.api.commandSync({
      url: `/listing-command-api/command/api/rest/listing/hearings/update-hearings`,
      body: { hearings },
      requestType: `application/vnd.listing.command.update-hearings-for-listing+json`,
      successEvent: `public.listing.hearings-update-completed`
    });
  }

  updateCourtRoomForSelectedHearingDays(hearingUpdatePayload: HearingAllocationPayload) {
    const { hearingId, judiciary, ...updateBody } = hearingUpdatePayload;
    return this.api.commandSync({
      url: `/listing-command-api/command/api/rest/listing/hearings/${hearingId}`,
      body: {
        ...updateBody,
        judiciary: judiciary
          ? judiciary.map(
              ({ judicialId, ...judge }) =>
                ({
                  judicialId: judicialId || judge.judicialMember.id,
                  judicialRoleType: judge.judicialRoleType,
                  isDeputy: judge.isDeputy,
                  isBenchChairman: judge.isBenchChairman
                }) as JudicialRole
            )
          : undefined
      },
      requestType: 'application/vnd.listing.command.update-hearing-for-listing+json',
      successEvent: 'public.listing.hearing-days-changed-for-hearing'
    });
  }

  downloadUpcomingHearings(options: SelectedFilterOptions) {
    const url = '/listing-query-api/query/api/rest/listing/hearings/download-hearing-csv-report';
    const requestType = 'text/csv';

    const params = this.toHttpParams(options);
    return this.api
      .query<Blob>({
        url,
        requestType,
        responseType: 'blob',
        params
      })
      .pipe(map(response => new Blob([response], { type: response.type })));
  }

  private mapWeekEndingPropertiesWithDefaults(hearing: Hearing, index) {
    // Assigned a value to allow us to group them together and allow current mags logic
    const defaultStartTime = '10:00:00';
    const durationMinutes = !hearing.allocated ? hearing.estimatedMinutes : 30;
    const defaulValueForNoCourtroom = 'NONE';
    if (!hearing.courtRoomId) {
      hearing.courtRoomId = defaulValueForNoCourtroom;
    }

    // There seems to be an issue from create a hearing in caag where
    // hearings are created with start date and week commencing start date
    // In addition to whatever this logic is , we need to cater for this issue.
    // Until the production defect is fixed. - Efe Arah
    if (!!hearing.startDate && !!hearing.weekCommencingStartDate) {
      if (hearing.allocated) {
        delete hearing.weekCommencingStartDate;
        delete hearing.weekCommencingEndDate;
        delete hearing.weekCommencingDurationInWeeks;
      } else {
        delete hearing.startDate;
        delete hearing.endDate;
        hearing.weekCommencingDurationInWeeks = hearing.weekCommencingDurationInWeeks ?? 1;
        hearing.weekCommencingEndDate =
          hearing.weekCommencingEndDate ??
          this.cppDate.format(
            this.cppDate.add(new Date(hearing.weekCommencingStartDate), 6, 'days')
          );
      }
    } else if (!!hearing.weekCommencingStartDate) {
      if ((hearing.hearingDays ?? []).length === 0) {
        const startTime = `${hearing.weekCommencingStartDate}T${
          hearing.courtCentreDetails?.defaultStartTime ?? defaultStartTime
        }`;
        const endTime = this.cppDate.format(
          this.cppDate.add(new Date(startTime), durationMinutes, 'minutes'),
          'YYYY-MM-DDTHH:mm:ss'
        );
        const hearingDate = `${hearing.weekCommencingStartDate}`;
        hearing.hearingDays = [
          {
            durationMinutes,
            startTime,
            endTime,
            hearingDate,
            sequence: index,
            courtRoomId: hearing.courtRoomId,
            courtCentreId: hearing.courtCentreId
          }
        ];
      }
    }

    return hearing;
  }

  private toHttpParams(params: any) {
    const cleanedParams = this.removeEmptyProperties(params);
    return Object.getOwnPropertyNames(cleanedParams).reduce(
      (p, key) => p.set(key, params[key]),
      new HttpParams()
    );
  }

  private removeEmptyProperties<T>(options: T): Partial<T> {
    return cleanDeep(options);
  }

  private searchUnscheduledHearings(
    options: SelectedFilterOptions
  ): Observable<PaginatedHearingResponse> {
    const params = this.toHttpParams({ ...options });
    return this.api
      .query<PaginatedHearingResponse>({
        url: '/listing-query-api/query/api/rest/listing/hearings/unscheduled',
        requestType: 'application/vnd.listing.search.hearings+json',
        params
      })
      .pipe(
        map(({ hearings, ...rest }: PaginatedHearingResponse) => {
          return {
            ...rest,
            hearings: hearings.map((hearing, index) => {
              if (!hearing.weekCommencingStartDate) {
                return hearing;
              }
              return this.mapWeekEndingPropertiesWithDefaults(hearing, index);
            })
          };
        })
      );
  }

  private searchHearings(
    options: SelectedFilterOptions,
    allocated: boolean
  ): Observable<PaginatedHearingResponse> {
    const params = this.toHttpParams(this.removeEmptyProperties({ ...options, allocated }));
    return this.api
      .query<{ hearings: Hearing[] }>({
        url: '/listing-query-api/query/api/rest/listing/hearings/range-search',
        requestType: 'application/vnd.listing.search.hearings+json',
        params
      })
      .pipe(
        map(({ hearings: h, ...rest }: PaginatedHearingResponse) => {
          const hearings: Hearing[] = h.map((hearing, index) => {
            if (!hearing.weekCommencingStartDate) {
              return hearing;
            }
            return this.mapWeekEndingPropertiesWithDefaults(hearing, index);
          });
          return {
            ...rest,
            hearings
          };
        })
      );
  }

  private getDataForPermissionRevoke(hearings: Hearing[], judiciaryType?: JudiciaryTypesGroups) {
    return hearings.reduce(
      (data, { listedCases = [], courtApplications = [], judiciary = [] }) => {
        if (listedCases.length > 0) {
          data.listedCaseIds = [...(data.listedCaseIds ?? []), ...listedCases.map(({ id }) => id)];
        }
        if (listedCases.length <= 0 && courtApplications.length > 0) {
          data.listedApplicationIds = [
            ...(data.listedApplicationIds ?? []),
            ...courtApplications.map(({ id }) => id)
          ];
        }

        if (judiciary.length > 0) {
          data.judiciaries = uniqBy(
            [
              ...(data.judiciaries ?? []),
              ...judiciary.filter(
                judi =>
                  (judiciaryType
                    ? judi.judicialRoleType.judiciaryType === judiciaryType
                    : judi.judicialRoleType.judiciaryType ===
                        JudiciaryTypesGroups.DEPUTY_DISTRICT_JUDGE ||
                      judi.judicialRoleType.judiciaryType === JudiciaryTypesGroups.RECORDER) &&
                  judi.judicialMember.cpUserId
              )
            ],
            'judicialId'
          );
        }
        return data;
      },
      {} as {
        listedCaseIds: string[];
        listedApplicationIds: string[];
        judiciaries: ExtendedJudicialRole[];
      }
    );
  }
  private sendNotificationNotifyEmail(
    sendToAddresses: string[],
    hearing: HearingWithSelectedCourtCentre,
    listOfUrns: string,
    selectedJudiciary: ExtendedJudicialRole
  ): Observable<unknown> {
    const { courtCentreName, hearingDate, timeOfSitting } = this.getNotificationEmailData(hearing);

    let templateId = this.appConfig.getNotificationEmailTemplateId();
    if (selectedJudiciary.judicialRoleType.judiciaryType === JudiciaryTypesGroups.RECORDER) {
      templateId = this.appConfig.getNotificationEmailTemplateIdRecorder();
    }

    const notificationEmails$: Observable<unknown>[] = [];
    sendToAddresses.forEach(sendToAddress => {
      const body = {
        templateId,
        sendToAddress,
        personalisation: {
          courtHouse: courtCentreName,
          hearingDate,
          timeOfSitting,
          listOfUrns: listOfUrns
        }
      };

      notificationEmails$.push(
        this.api.command({
          url: `/notificationnotify-command-api/command/api/rest/notificationnotify/notifications/${uuid()}`,
          requestType: 'application/vnd.notificationnotify.email+json',
          body
        })
      );
    });

    return merge(...notificationEmails$);
  }

  private getNotificationEmailData({
    selectedCourtCentre,
    hearingDays,
    startDate,
    nonDefaultDays
  }: HearingWithSelectedCourtCentre) {
    if ((hearingDays ?? []).length > 0) {
      return {
        courtCentreName: selectedCourtCentre?.courtCentreName,
        hearingDate: moment(hearingDays[0].hearingDate).format('DD/MM/YYYY'),
        timeOfSitting: moment(hearingDays[0].startTime).format('HH:mm')
      };
    }

    // we use a default start time if we can not find a non defaultday (given that a fake non default day is created tfor single day hearrings)
    // If It is a multiday hearing with no non default day for the start date, we assume 10:00am .
    // This can be enhanced to use the court centre default start time - Currently not used as we are not sure
    // If the selectedCourt centre payload within the hearing, will accept in the Back end
    const { startTime } = (nonDefaultDays ?? []).find(
      ({ startTime }) => moment(startTime).format('YYYY-MM-DD') === startDate
    ) ?? { startTime: `${startDate}T10:00` };
    return {
      courtCentreName: selectedCourtCentre?.courtCentreName,
      hearingDate: moment(startTime).format('DD/MM/YYYY'),
      timeOfSitting: moment(startTime).format('HH:mm')
    };
  }
}
