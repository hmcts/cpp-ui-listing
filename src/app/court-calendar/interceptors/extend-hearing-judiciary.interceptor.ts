import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  JudicialMember,
  JudiciaryTypeGroup,
  JudiciaryTypesGroups,
  mapRefDataJudiciaryToJudiciaryType,
  RefDataJudiciaryType,
  ReferenceDataService
} from '@cpp/reference-data';
import { uniq } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { Hearing, PaginatedHearingResponse } from '../../core';

export const extendHearingJudiciaryInterceptor: HttpInterceptorFn = (req, next) => {
  const requestAccept = req.headers.get('Accept');
  const acceptTypes = [
    'application/vnd.listing.search.hearings+json',
    'application/vnd.listing.search.hearing+json',
    'application/vnd.listing.search.hearings.court.calendar+json'
  ];
  const refDataService = inject(ReferenceDataService);
  if (acceptTypes.includes(requestAccept)) {
    return next(req).pipe(
      filter(
        (event): event is HttpResponse<PaginatedHearingResponse | Hearing> =>
          event instanceof HttpResponse
      ),
      switchMap((response) => {
        const variant1 = response.body as Hearing;
        const variant2 = response.body as PaginatedHearingResponse;
        if (requestAccept === 'application/vnd.listing.search.hearing+json') {
          return extendHearingsJudiciary$(refDataService, [variant1]).pipe(
            map<Hearing[], HttpResponse<Hearing>>(([hearing]) => response.clone({ body: hearing }))
          );
        }
        return extendHearingsJudiciary$(refDataService, variant2.hearings).pipe(
          map<Hearing[], HttpResponse<PaginatedHearingResponse>>((hearings) =>
            response.clone({
              body: {
                ...variant2,
                hearings
              }
            })
          )
        );
      })
    );
  }
  return next(req);
};

const extendHearingsJudiciary$ = (
  refDataService: ReferenceDataService,
  hearings: Hearing[]
): Observable<Hearing[]> => {
  return of(
    hearings.reduce(
      (judicialIds, hearing) => [
        ...judicialIds,
        ...(hearing.judiciary || []).map((judiciaryRole) => judiciaryRole.judicialId)
      ],
      [] as string[]
    )
  ).pipe(
    map(uniq),
    switchMap((ids) =>
      ids.length === 0 ? of([]) : refDataService.fetchJudicialMembers({ ids: ids.join(',') })
    ),
    map((judicialMembers: JudicialMember[]) =>
      hearings.map((hearing) => ({
        ...hearing,
        judiciary: (hearing.judiciary || []).map((judicialRole) => {
          const judicialMember = judicialMembers.find(({ id }) => id === judicialRole.judicialId);

          if (
            judicialRole.judicialRoleType &&
            judicialRole.judicialRoleType.judiciaryType &&
            !(Object.values(JudiciaryTypesGroups) as string[]).includes(
              judicialRole.judicialRoleType.judiciaryType
            )
          ) {
            judicialRole.judicialRoleType.judiciaryType =
              mapRefDataJudiciaryToJudiciaryType(
                judicialRole.judicialRoleType.judiciaryType as RefDataJudiciaryType
              ) ?? (judicialRole.judicialRoleType.judiciaryType as JudiciaryTypeGroup);
          }
          return {
            ...judicialRole,
            judicialMember
          };
        })
      }))
    )
  );
};
