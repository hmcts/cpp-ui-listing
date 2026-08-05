import {
  getAllocatedHearings,
  getAvailableHearings,
  getHearingToEditAllocation,
  getJudiciaries,
  getScheduledHearingForAllocation,
  hasSplitHearingFromUnallocated
} from '../selectors';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getOrganisationUnits,
  JudiciaryTypesGroups,
  mapRefDataJudiciaryToJudiciaryType,
  OrganisationUnit
} from '@cpp/reference-data';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import * as FileSaver from 'file-saver';
import momentTimezone from 'moment-timezone';
import { forkJoin, from, Observable, of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  mapTo,
  mergeMap,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import {
  AllocateHearingAction,
  AllocateHearingSuccessAction,
  ApiError,
  ChangeJudicaryForHearingsAction,
  ChangeJudicaryForHearingsSuccessAction,
  DownloadListAction,
  downloadPrisonListAction,
  ExtendHearingForHearingAction,
  ExtendHearingForHearingSuccessAction,
  ListUnallocatedHearingsAction,
  ListUnallocatedHearingsSuccessAction,
  ListUnscheduledHearingsAction,
  ListUnscheduledHearingsSuccessAction,
  SearchAllocatedHearingsAction,
  SearchAllocatedHearingsByDateRangeAction,
  SearchAllocatedHearingsByDateRangeSuccessAction,
  searchAllocatedHearingsForPrisonListAction,
  SearchAllocatedHearingsSuccessAction,
  SearchAvailableHearingsAction,
  SearchAvailableHearingsSuccessAction,
  SequenceHearingAction,
  SequenceHearingSuccessAction,
  setEditAllocationError,
  SetPublishListStatusAction,
  SetPublishListStatusSuccessAction,
  ShowUnallocatedHearingsAction,
  ShowUnscheduledHearingsAction,
  TypeOfListActionSuccess,
  UpdateAdjournedHearingJudiciaryAction,
  UpdateAllocatedHearingAction,
  UpdateAllocatedHearingSuccessAction,
  WeekCommencingHearingSearchAction,
  WeekCommencingHearingSearchSuccessAction
} from '../actions';
import * as HearingActions from '../actions/hearing';
import { AllocatingHearingDetailsWithCourtCentre, Hearing, JudicialRole } from '../model';
import { AppState } from '../reducers';
import { HearingSearchService, ListingService } from '../services';
import { getCPPDate } from '../util';
import {
  ExtendedJudicialRole,
  HearingWithSelectedCourtCentre,
  PaginatedHearingResponse,
  UnallocatedHearings
} from '../model/hearing';
import { RolePermission, UsersGroupsService } from '@cpp/users-groups';
import { ValidationError } from '@cpp/pdk';
import {
  createListingNote,
  createListingNoteSuccess,
  deleteListingNote,
  deleteListingNoteSuccess,
  ListingNotesService,
  loadListingNotes,
  SchedulingService,
  SearchHearingSlotsParams,
  showListingNoteSuccessMessage,
  updateListingNote,
  updateListingNoteSuccess
} from '@cpp/scheduling';
import uuid from 'uuid/v4';

const prisonlistType = 'Prison list';
const upcomingHearings = 'Upcoming Hearings';
const prisonListextension = '.pdf';
const upcomingHearingsExtension = '.csv';
const EDIT_ALLOCATION_ERROR = 'No sessions available for updated criteria';

@Injectable()
export class HearingEffects {
  constructor(
    private actions$: Actions,
    private listing: ListingService,
    private store: Store<AppState>,
    private hearingSearchService: HearingSearchService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userGroupService: UsersGroupsService,
    private scheduling: SchedulingService,
    private listingNotesService: ListingNotesService
  ) {}

  listUnallocatedHearings$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(
        HearingActions.LIST_UNALLOCATED_HEARINGS,
        HearingActions.LIST_UNALLOCATED_FIXED_AND_WEEK_COMMENCING_HEARINGS
      ),
      switchMap((action: ListUnallocatedHearingsAction) =>
        this.listing.getUnallocatedHearings(action.filterOptions).pipe(
          map(
            ({ hearings, pageCount, results }: PaginatedHearingResponse) =>
              ({
                hearings,
                pagination: {
                  currentPage: action.filterOptions.pageNumber,
                  pageCount,
                  totalNumber: results
                }
              }) as UnallocatedHearings
          ),
          switchMap(paginatedHearings => [
            new ListUnallocatedHearingsSuccessAction({ ...paginatedHearings }),
            new ShowUnallocatedHearingsAction(true)
          ]),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );
  listUnscheduledHearings$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.LIST_UNSCHEDULED_HEARINGS),
      switchMap((action: ListUnscheduledHearingsAction) =>
        this.listing.getUnscheduledHearings(action.filterOptions).pipe(
          map(({ hearings, pageCount, results }) => {
            return {
              pagination: {
                currentPage: action.filterOptions.pageNumber,
                pageCount,
                totalNumber: results
              },
              hearings
            };
          }),
          switchMap(paginatedHearings => [
            new ListUnscheduledHearingsSuccessAction(paginatedHearings),
            new ShowUnscheduledHearingsAction(true)
          ]),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );

  typeOfList$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.TYPE_OF_LIST),
      switchMap(() =>
        this.listing.getTypeOfList().pipe(
          switchMap(data => [new TypeOfListActionSuccess(data)]),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );

  allocateHearing$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.ALLOCATE_HEARING_ACTION),
      withLatestFrom(
        this.store.select(getScheduledHearingForAllocation),
        this.store.select(hasSplitHearingFromUnallocated)
      ),
      switchMap(
        ([{ payload }, hearing, splitHearingUnallocated]: [
          AllocateHearingAction,
          Hearing,
          boolean
        ]) => {
          const { listedCases } = hearing;
          const { originHearing, updatedHearing } = payload;

          const { hasVideoLink = false, publicListNote = '' } = updatedHearing;
          const prosecutionCases: {
            caseId: string;
            defendants: {
              defendantId: string;
              offences: { offenceId: string }[];
            }[];
          }[] =
            !!listedCases && listedCases.length > 0
              ? this.listing.extractProsecutionCasesIdsFromHearing(hearing)
              : [];

          const permissionHandler$ = this.permissionsHandlerForJudiciaries(
            [originHearing],
            updatedHearing.judiciary
          );

          const notificationHandler$ = this.notificationsHandlerForJudiciaries(
            [originHearing],
            [updatedHearing as HearingWithSelectedCourtCentre],
            updatedHearing.judiciary
          );

          return forkJoin([
            updatedHearing.weekCommencingStartDate
              ? this.listing.updateUnallocatedHearing(
                  updatedHearing,
                  prosecutionCases,
                  splitHearingUnallocated
                )
              : this.listing.allocateHearing(
                  {
                    courtCentreId: updatedHearing.courtCentreId,
                    courtRoomId: updatedHearing.courtRoomId,
                    endDate: updatedHearing.endDate,
                    hearingId: updatedHearing.id,
                    hearingLanguage: updatedHearing.hearingLanguage,
                    judiciary: updatedHearing.judiciary,
                    jurisdictionType: updatedHearing.jurisdictionType,
                    nonDefaultDays: updatedHearing.nonDefaultDays,
                    nonSittingDays: updatedHearing.nonSittingDays,
                    prosecutionCases,
                    startDate: updatedHearing.startDate,
                    publicListNote,
                    hasVideoLink,
                    type: updatedHearing.type,
                    bookingType: updatedHearing.bookingType,
                    priority: updatedHearing.priority,
                    specialRequirements: updatedHearing.specialRequirements,
                    sendNotificationToParties: updatedHearing.sendNotificationToParties
                  },
                  splitHearingUnallocated
                ),
            permissionHandler$,
            notificationHandler$
          ]).pipe(
            tap(() =>
              !!this.activatedRoute.snapshot.queryParams.isUnscheduled
                ? this.router.navigate(['/unscheduled'])
                : this.router.navigate(['/unallocated'])
            ),
            map(() => new AllocateHearingSuccessAction()),
            catchError(err => of(new ApiError(err)))
          );
        }
      )
    )
  );
  updateAllocatedHearing$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.UPDATE_ALLOCATED_HEARING_ACTION),
      withLatestFrom(this.store.select(getHearingToEditAllocation)),
      switchMap(([action, originHearing]: [UpdateAllocatedHearingAction, Hearing]) => {
        const { updatedHearing } = action.payload as AllocatingHearingDetailsWithCourtCentre;
        const { judiciary } = updatedHearing;
        const {
          endDate: originEndDate,
          courtRoomId: originCourtRoomId,
          startDate: originStartDate,
          hearingDays: [{ startTime: originStartTime }]
        } = originHearing;

        const {
          endDate: updatedEndDate,
          courtRoomId: updatedCourtRoomId,
          startDate: updatedStartDate,
          jurisdictionType,
          nonDefaultDays
        } = updatedHearing;

        const updatedStartTime = nonDefaultDays?.[0]?.startTime;

        const isSingleDay = updatedStartDate === updatedEndDate;

        // For single day hearings, we check for any changes in:
        // - start date, courtroom, or start time to determine if slot validation is needed
        // For multi-day hearings, we don't perform any checks.
        const slotsCheck =
          isSingleDay &&
          (originStartDate !== updatedStartDate ||
            originEndDate !== updatedEndDate ||
            originCourtRoomId !== updatedCourtRoomId ||
            (updatedStartTime && originStartTime !== updatedStartTime)) &&
          jurisdictionType !== 'CROWN';

        if (slotsCheck) {
          const searchParams: SearchHearingSlotsParams = {
            courtRoomId: updatedCourtRoomId,
            sessionStartDate: updatedStartDate,
            sessionEndDate: updatedEndDate || updatedStartDate,
            hearingStartTime: updatedStartTime,
            panel: 'ADULT,YOUTH',
            ouCode: updatedHearing.selectedCourtCentre.ouCode,
            pageNumber: 1,
            pageSize: 10,
            showOverbookedSlots: true
          };

          return this.scheduling.searchHearingSlots(searchParams).pipe(
            switchMap(({ hearingSlots }) => {
              if (hearingSlots.length === 0) {
                const editAllocationError: ValidationError = {
                  id: 'searchSlotError',
                  message: EDIT_ALLOCATION_ERROR
                };
                return of(
                  setEditAllocationError({ editAllocationError }),
                  new UpdateAllocatedHearingSuccessAction(originHearing)
                );
              }
              return this.updateHearing(updatedHearing, originHearing, judiciary);
            }),
            catchError(err => of(new ApiError(err)))
          );
        }
        return this.updateHearing(updatedHearing, originHearing, judiciary);
      })
    )
  );

  sequenceHearings$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.SEQUENCE_HEARINGS_ACTION),
      switchMap((action: SequenceHearingAction) =>
        this.listing.sequenceHearings(action.payload.hearings).pipe(
          map(() => new SequenceHearingSuccessAction(action.payload)),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );

  extendHearingForHearing$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.EXTEND_HEARING_FOR_HEARING),
      withLatestFrom(
        this.store.select(getAvailableHearings),
        this.store.select(getScheduledHearingForAllocation)
      ),
      switchMap(
        ([action, availableHearings, scheduledAllocatedHearing]: [
          ExtendHearingForHearingAction,
          Hearing[],
          Hearing
        ]) => {
          const { payload } = action;
          const currentHearing = availableHearings.find(
            availableHearing => availableHearing.temporaryHearingId === payload.extendedHearingId
          );
          const prosecutionCasesIds: {
            caseId: string;
            defendants: {
              defendantId: string;
              offences: { offenceId: string }[];
            }[];
          }[] = this.listing.extractProsecutionCasesIdsFromHearing(scheduledAllocatedHearing);
          const hearing = {
            ...currentHearing,
            selectedHearingId: payload.selectedHearingId,
            listedCases: scheduledAllocatedHearing.listedCases,
            sendNotificationToParties: payload.sendNotificationToParties,
            prosecutionCasesIds
          };

          return this.listing
            .extendHearingForHearing(
              hearing.selectedHearingId,
              hearing.id,
              currentHearing.allocated,
              hearing.sendNotificationToParties,
              hearing.prosecutionCasesIds
            )
            .pipe(
              map(() => new ExtendHearingForHearingSuccessAction(hearing)),
              tap(() => {
                payload.isUnscheduledHearing
                  ? this.router.navigate(['/unscheduled'])
                  : this.router.navigate(['/unallocated']);
              }),
              catchError(err => of(new ApiError(err)))
            );
        }
      )
    )
  );

  searchAllocatedHearings$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.SEARCH_ALLOCATED_HEARINGS),
      switchMap((action: SearchAllocatedHearingsAction) =>
        this.hearingSearchService.searchHearingsWithTimeRange(action.payload.options).pipe(
          switchMap(({ hearings, notes }) => [
            new SearchAllocatedHearingsSuccessAction(hearings),
            loadListingNotes({ notes }),
            new UpdateAdjournedHearingJudiciaryAction()
          ]),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );

  updateAdjournedHearingJudiciary$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.UPDATE_ADJOURNED_HEARING_JUDICIARY),
      withLatestFrom(this.store.select(getAllocatedHearings)),
      switchMap(
        ([_, allocatedHearings]): Observable<
          {
            permissions: RolePermission[];
            hearing: Hearing;
            judiciaries?: ExtendedJudicialRole[];
          }[]
        > => {
          const adjournedHearings = allocatedHearings.filter(
            hearing =>
              hearing.adjournedFromDate && hearing.judiciary && hearing.judiciary.length === 0
          );

          if (adjournedHearings.length === 0) {
            return of([]);
          }

          const permissions$: Observable<{
            permissions: RolePermission[];
            hearing: Hearing;
            judiciaries?: ExtendedJudicialRole[];
          }>[] = [];

          adjournedHearings.forEach(hearing => {
            const caseIds = hearing.listedCases.map(listedCase => listedCase.id);

            permissions$.push(
              from(caseIds).pipe(
                switchMap(id =>
                  this.userGroupService
                    .getPermissionsBy({ object: 'Case', action: 'Access', target: id })
                    .pipe(switchMap(permissions => of({ permissions: permissions || [], hearing })))
                )
              )
            );
          });

          return forkJoin(permissions$);
        }
      ),
      filter(permissionByHearing => permissionByHearing?.length > 0),
      withLatestFrom(this.store.select(getJudiciaries)),
      switchMap(([permissionsByHearing, judiciaries]) => {
        permissionsByHearing.forEach(permission => {
          const distinctCpUserIds = [...new Set(permission.permissions.map(p => p.source))];

          permission.judiciaries = judiciaries
            .filter(judiciary => distinctCpUserIds.includes(judiciary.cpUserId))
            .map(judiciary => ({
              judicialId: judiciary.id,
              judicialMember: judiciary,
              judicialRoleType: {
                judiciaryType: mapRefDataJudiciaryToJudiciaryType(
                  judiciary.judiciaryType
                ) as JudiciaryTypesGroups
              }
            }));
        });

        return from(permissionsByHearing).pipe(
          map(permissionByHearing => ({
            ...(permissionByHearing.hearing as HearingWithSelectedCourtCentre),
            judiciary: [
              ...permissionByHearing.hearing.judiciary,
              ...permissionByHearing.judiciaries
            ]
          })),
          filter(updatedHearing => updatedHearing?.judiciary?.length > 0),
          switchMap(updatedHearing => {
            return this.listing
              .changeJudiciaryForHearings({
                hearings: [updatedHearing.id],
                judiciary: updatedHearing.judiciary.map(
                  ({ judicialMember, ...rest }) => rest as JudicialRole
                )
              })
              .pipe(
                map(() => new UpdateAllocatedHearingSuccessAction(updatedHearing)),
                catchError(err => of(new ApiError(err)))
              );
          })
        );
      })
    )
  );

  searchAllocatedHearingsByDateRange$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.SEARCH_ALLOCATED_HEARINGS_BY_DATE_RANGE),
      switchMap((action: SearchAllocatedHearingsByDateRangeAction) =>
        this.hearingSearchService.getAllocatedHearings(action.payload.options).pipe(
          map(
            ({ hearings, results, pageCount }) =>
              new SearchAllocatedHearingsByDateRangeSuccessAction({
                hearings,
                pagination: {
                  pageCount,
                  totalNumber: results,
                  currentPage: action.payload.options.pageNumber
                }
              })
          ),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );

  searchWeekCommencingHearingsByDateRange$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.WEEK_COMMENCING_HEARING_ACTION),
      switchMap((action: WeekCommencingHearingSearchAction) =>
        this.hearingSearchService.getAllocatedHearings(action.payload.options).pipe(
          map(
            ({ hearings, pageCount, results }) =>
              new WeekCommencingHearingSearchSuccessAction({
                hearings,
                pagination: {
                  pageCount,
                  totalNumber: results,
                  currentPage: action.payload.options.pageNumber
                }
              })
          ),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );

  changeJudiciaryForHearings$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.CHANGE_JUDICIARY_FOR_HEARINGS_ACTION),
      switchMap((action: ChangeJudicaryForHearingsAction) => {
        const { hearings, judiciary: judiciaries } = action.payload;

        const permissionHandler$ = this.permissionsHandlerForJudiciaries(hearings, judiciaries);

        const notificationHandler$ = this.notificationsHandlerForJudiciaries(
          hearings,
          hearings,
          judiciaries
        );

        return forkJoin([
          this.listing.changeJudiciaryForHearings({
            hearings: hearings.map(h => h.id),
            judiciary:
              judiciaries && judiciaries.map(({ judicialMember, ...rest }) => rest as JudicialRole)
          }),
          permissionHandler$,
          notificationHandler$
        ]).pipe(
          map(() => new ChangeJudicaryForHearingsSuccessAction(action.payload)),
          catchError(err => of(new ApiError(err)))
        );
      })
    )
  );

  downloadCourtList$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.DOWNLOAD_LIST_ACTION),
      withLatestFrom(this.store.pipe(select(getOrganisationUnits))),
      mergeMap(([action, organisationUnits]: [DownloadListAction, OrganisationUnit[]]) => {
        const { options } = action.payload;

        return this.listing.downloadCourtList(options).pipe(
          tap(blob => {
            const ou = organisationUnits.find(({ id }) => id === options.courtCentreId);
            const courtroom = ou.courtrooms.find(({ id }) => id === options.courtRoomId);

            let listType = 'Court list';
            let extension = '.pdf';

            switch (options.courtListType) {
              case 'ALPHABETICAL':
                listType = 'Alphabetical list';
                break;
              case 'PUBLIC':
                listType = 'Public court list';
                break;
              case 'JUDGE':
                listType = 'Judge list';
                break;
              case 'BENCH':
                listType = `Bench list${options.restricted ? ' (restricted)' : ''}`;
                break;
              case 'STANDARD':
                listType = `Standard court list`;
                break;
              case 'USHERS_MAGISTRATE':
              case 'USHERS_CROWN':
                extension = '.docx';
                listType = `Ushers list`;
                break;
              case 'DRAFT':
                listType = `Daily list`;
                break;
            }

            FileSaver.saveAs(
              blob,
              `${listType} - ${ou.oucodeL3Name}, ${
                courtroom ? courtroom.courtroomName : 'All courtrooms'
              } - ${options.startDate === options.endDate ? '' : 'W/C '}${momentTimezone(
                options.startDate
              ).format('DD-MM-YYYY')}${extension}`
            );
          }),
          mapTo(new HearingActions.DownloadListSuccessAction()),
          catchError(err => {
            return of(new ApiError(err));
          })
        );
      })
    )
  );

  updateCourtRestrictions$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.COURT_RESTRICTION_ACTION),
      switchMap((action: HearingActions.CourtRestrictionAction) => {
        return this.listing.updateCourtRestrictionsSync(action.payload.courtRestriction).pipe(
          switchMap(() => {
            const options = action.payload.options;
            const courtRestriction = action.payload.courtRestriction;
            const weekCommencingCrown = options.isCrownCourt && options.weekCommencingStartDate;
            return weekCommencingCrown
              ? [
                  new HearingActions.WeekCommencingHearingSearchAction({
                    options
                  }),
                  new HearingActions.CourtRestrictionSuccessAction({
                    courtRestriction
                  })
                ]
              : [
                  new HearingActions.SearchAllocatedHearingsByDateRangeAction({
                    options
                  }),
                  new HearingActions.CourtRestrictionSuccessAction({
                    courtRestriction
                  })
                ];
          }),
          catchError(err => {
            return of(new ApiError(err));
          })
        );
      })
    )
  );

  searchAvailableHearings$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.SEARCH_AVAILABLE_HEARINGS),
      switchMap((action: SearchAvailableHearingsAction) =>
        this.listing.searchAvailableHearings(action.payload).pipe(
          map(({ hearings, notes }) => {
            const splitHearings = this.splitFutureHearingDays(hearings);
            const sortedHearings = this.sortByHearingDay(splitHearings);
            return { hearings: sortedHearings, notes };
          }),
          switchMap(({ hearings, notes }) => [
            new SearchAvailableHearingsSuccessAction(hearings),
            loadListingNotes({ notes })
          ]),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );

  publishCourtList$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.SET_PUBLISH_LIST_STATUS_ACTION),
      switchMap((action: SetPublishListStatusAction) => {
        return this.listing.publishCourtListStatus(action.payload).pipe(
          map(() => {
            return new SetPublishListStatusSuccessAction(action.payload);
          }),
          catchError(err => {
            return of(new ApiError(err));
          })
        );
      })
    )
  );

  getLatestCourtListStatus$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.GET_PUBLISH_LIST_STATUS_ACTION),
      switchMap((action: HearingActions.GetPublishListStatusAction) => {
        return this.listing.retrieveLatestCourtListStatus(action.payload).pipe(
          map((publishCourtListStatuses: any) => {
            return new HearingActions.GetPublishListStatusSuccessAction(publishCourtListStatuses);
          }),
          catchError(err => {
            return of(new ApiError(err));
          })
        );
      })
    )
  );

  createListingNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createListingNote),
      switchMap(({ note }) =>
        this.listingNotesService.createListingNotes(note).pipe(
          map(createdNote => createListingNoteSuccess({ note: createdNote })),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );

  updateListingNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateListingNote),
      switchMap(noteData =>
        this.listingNotesService.updateListingNote(noteData).pipe(
          map(({ noteId, noteDescription }) => {
            this.store.dispatch(
              showListingNoteSuccessMessage({ successMessage: 'Listing note saved' })
            );
            return updateListingNoteSuccess({ noteId, noteDescription });
          }),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );

  deleteListingNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteListingNote),
      switchMap(({ noteId: id }) =>
        this.listingNotesService.deleteListingNote(id).pipe(
          map(({ noteId }) => {
            this.store.dispatch(
              showListingNoteSuccessMessage({ successMessage: 'Listing note deleted' })
            );
            return deleteListingNoteSuccess({ noteId });
          }),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );

  searchAllocatedHearingsForPrisonList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(searchAllocatedHearingsForPrisonListAction),
      switchMap(({ options }) =>
        this.listing.getAllocatedHearings(options).pipe(
          map(
            ({ hearings, results, pageCount }) =>
              new SearchAllocatedHearingsByDateRangeSuccessAction({
                hearings,
                pagination: {
                  pageCount,
                  totalNumber: results,
                  currentPage: options.pageNumber
                }
              })
          ),
          catchError(err => of(new ApiError(err)))
        )
      )
    )
  );

  downloadPrisonList$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(downloadPrisonListAction),
      withLatestFrom(this.store.pipe(select(getOrganisationUnits))),
      mergeMap(
        ([{ options }, organisationUnits]: [
          ReturnType<typeof downloadPrisonListAction>,
          OrganisationUnit[]
        ]) => {
          return this.listing.downloadPrisonList(options).pipe(
            tap(blob => {
              const ou = organisationUnits.find(({ id }) => id === options.courtCentreId);
              const courtroom = ou.courtrooms.find(({ id }) => id === options.courtRoomId);

              FileSaver.saveAs(
                blob,
                `${prisonlistType} - ${ou.oucodeL3Name}, ${
                  courtroom ? courtroom.courtroomName : 'All courtrooms'
                } - ${options.startDate === options.endDate ? '' : 'W/C '}${momentTimezone(
                  options.startDate
                ).format('DD-MM-YYYY')}${prisonListextension}`
              );
            }),
            mapTo(HearingActions.downloadPrisonListSuccessAction()),
            catchError(err => {
              return of(new ApiError(err));
            })
          );
        }
      )
    )
  );

  // Split multiple days hearings into individual hearing objects with only one hearing day
  // Also, remove the future hearings i.e. hearingDay.endTime >= currentDay.time (we do a day check)
  // i.e. {hearingId: '123' , hearingDays: [1, 2]} ==> {hearingId: '123', hearingDays: [1]}, {hearingId: '123', hearingDays: [2]}
  private splitFutureHearingDays(hearings: Hearing[]): Hearing[] {
    const dateUtil = getCPPDate();
    const currentDate = dateUtil.getCurrentDate();
    const futureHearings = [];
    for (const hearing of hearings) {
      const futureHearingDays = hearing.hearingDays.filter(
        hearingDay =>
          dateUtil.isSame(hearingDay.endTime, currentDate, 'day') ||
          dateUtil.isAfter(hearingDay.endTime, currentDate, 'day')
      );
      for (const hearingDay of futureHearingDays) {
        futureHearings.push({
          ...hearing,
          temporaryHearingId: uuid(),
          hearingDays: [hearingDay]
        });
      }
    }
    return futureHearings;
  }

  private sortByHearingDay(hearings: Hearing[]): Hearing[] {
    const dateUtil = getCPPDate();
    return hearings.sort((firstHearing, secondHearing) =>
      dateUtil.diff(
        firstHearing.hearingDays[0].startTime,
        secondHearing.hearingDays[0].startTime,
        'milliseconds'
      )
    );
  }

  private notificationsHandlerForJudiciaries(
    originHearings: Hearing[],
    updatedHearings: HearingWithSelectedCourtCentre[],
    judiciaries: ExtendedJudicialRole[]
  ) {
    let notification$: Observable<any> = of(null);

    const judiciaryTypesToBeSelected = [
      JudiciaryTypesGroups.DEPUTY_DISTRICT_JUDGE,
      JudiciaryTypesGroups.RECORDER
    ];

    judiciaryTypesToBeSelected.forEach(judiciaryType => {
      const alreadyAssignedJudiciary = originHearings.filter(hearing =>
        hearing.judiciary.some(judi => judi.judicialRoleType.judiciaryType === judiciaryType)
      );

      const selectedJudiciary = judiciaries.find(
        judiciary => judiciary.judicialRoleType.judiciaryType === judiciaryType
      );

      const isSelectedJudiciarySame = selectedJudiciary
        ? alreadyAssignedJudiciary.filter(a =>
            a.judiciary.some(ju => ju.judicialId === selectedJudiciary.judicialId)
          ).length > 0
        : false;

      const hasSelectedJudiciary = selectedJudiciary ? !!selectedJudiciary.judicialId : false;

      const hasAlreadyAssignedJudiciary = alreadyAssignedJudiciary.length > 0;

      if (!hasAlreadyAssignedJudiciary && hasSelectedJudiciary) {
        notification$ = this.listing.sendEmailNotification(
          updatedHearings,
          judiciaries,
          judiciaryType
        );
      }

      if (hasAlreadyAssignedJudiciary && hasSelectedJudiciary && !isSelectedJudiciarySame) {
        notification$ = this.listing.sendEmailNotification(
          updatedHearings,
          judiciaries,
          judiciaryType
        );
      }
    });

    return notification$;
  }

  private permissionsHandlerForJudiciaries(
    originHearings: Hearing[],
    judiciaries: ExtendedJudicialRole[]
  ) {
    let permission$: Observable<any> = of(null);

    const judiciaryTypesToBeSelected = [
      JudiciaryTypesGroups.DEPUTY_DISTRICT_JUDGE,
      JudiciaryTypesGroups.RECORDER
    ];

    judiciaryTypesToBeSelected.forEach(judiciaryType => {
      const alreadyAssignedJudiciary = originHearings.filter(hearing =>
        hearing.judiciary.some(judi => judi.judicialRoleType.judiciaryType === judiciaryType)
      );

      const selectedJudiciary = judiciaries.find(
        judiciary => judiciary.judicialRoleType.judiciaryType === judiciaryType
      );

      const isSelectedJudiciarySame = selectedJudiciary
        ? alreadyAssignedJudiciary.filter(a =>
            a.judiciary.some(ju => ju.judicialId === selectedJudiciary.judicialId)
          ).length > 0
        : false;

      const hasSelectedJudiciary = selectedJudiciary ? !!selectedJudiciary.judicialId : false;

      const hasAlreadyAssignedJudiciary = alreadyAssignedJudiciary.length > 0;

      if (!hasAlreadyAssignedJudiciary && hasSelectedJudiciary) {
        permission$ = this.listing.grantBulkJudiciaryPermission(originHearings, judiciaries);
      }

      if (hasAlreadyAssignedJudiciary && hasSelectedJudiciary && !isSelectedJudiciarySame) {
        permission$ = this.listing
          .revokeBulkJudiciaryPermission(originHearings, judiciaryType)
          .pipe(
            switchMap(() => this.listing.grantBulkJudiciaryPermission(originHearings, judiciaries))
          );
      }

      if (hasAlreadyAssignedJudiciary && !hasSelectedJudiciary) {
        permission$ = this.listing.revokeBulkJudiciaryPermission(originHearings, judiciaryType);
      }
    });

    return permission$;
  }

  private updateHearing = (
    hearing: HearingWithSelectedCourtCentre,
    originHearing: Hearing,
    judiciary: ExtendedJudicialRole[]
  ) => {
    const permissionHandler$ = this.permissionsHandlerForJudiciaries([originHearing], judiciary);

    const notificationHandler$ = this.notificationsHandlerForJudiciaries(
      [originHearing],
      [hearing],
      judiciary
    );
    return forkJoin([
      this.listing.updateAllocatedHearing(hearing),
      permissionHandler$,
      notificationHandler$
    ]).pipe(
      map(() => new UpdateAllocatedHearingSuccessAction(hearing)),
      catchError(err => of(new ApiError(err)))
    );
  };

  downloadUpcomingHearings$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(HearingActions.downloadUpcomingHearingsAction),
      withLatestFrom(this.store.pipe(select(getOrganisationUnits))),
      mergeMap(
        ([{ options }, organisationUnits]: [
          ReturnType<typeof HearingActions.downloadUpcomingHearingsAction>,
          OrganisationUnit[]
        ]) => {
          return this.listing.downloadUpcomingHearings(options).pipe(
            tap(blob => {
              const ou = organisationUnits.find(({ id }) => id === options.courtCentreId);
              FileSaver.saveAs(
                blob,
                `${upcomingHearings} - ${ou.oucodeL3Name}${upcomingHearingsExtension}`
              );
            }),
            mapTo(HearingActions.downloadUpcomingHearingsSuccessAction()),
            catchError(err => {
              return of(new ApiError(err));
            })
          );
        }
      )
    )
  );
}
