import { sortBy, uniq } from 'lodash-es';
import { getCPPDate } from '../../core/util';
import { Defendant, Hearing, ListedCase, Offence } from '../../core';
import {
  AllocatedWidgetCourtroomCalendarVm,
  AllocationHearingsSectionVm,
  CourtRoomCalendarVM,
  HearingDefendantVM,
  HearingRowVM,
  HearingTypeVM,
  caseReferncesVM
} from '../model';
import { generateId } from '@cpp/pdk';
import { CourtApplicationPartyType } from '../../core/model/court-application';
import { dateIsCurrentOrGreaterThan } from './court-calendar-hearings-helper';

const cppDate = getCPPDate();
type HearingForCaseInstance = Omit<Hearing, 'listedCases'> & {
  instances?: number;
  isLastChild?: boolean;
  listedCase: ListedCase;
};

export function getHearingsViewModel(
  hearings: Hearing[],
  date: string,
  defaultStartTime = '00:00',
  forMultiReallocate = false
): HearingRowVM[] {
  let duration: number;
  // Because the hearing could have multiple cases, we create a view model per case instance,
  // identifying the primary hearing view model
  const hearingsByCase = mapToHearingsForCaseInstances(hearings);
  return hearingsByCase.map(({ hearingDays, isLastChild, instances, ...rest }) => {
    const { startTime, durationMinutes, sequence } = hearingDays?.find(
      ({ hearingDate }) => hearingDate === date
    ) ?? {
      startTime: `${date}T${defaultStartTime}`
    };

    if (forMultiReallocate) {
      duration = rest.hearingDayCount * 360;
    } else {
      duration = !rest.allocated ? rest.estimatedMinutes : durationMinutes;
    }
    const isMultiDayMagistratesHearing =
      rest.hearingDayCount > 1 && rest.jurisdictionType === 'MAGISTRATES';
    return {
      id: rest.id,
      dateTime: cppDate.format(startTime, 'YYYY-MM-DDTHH:mm'),
      duration,
      hearingDate: date,
      publicListNote: rest.publicListNote,
      hearingType: getHearingTypeVm(rest),
      defendants: getDefendantsVM(rest),
      offences: getOffencesVM(rest),
      judiciary: rest.judiciary,
      sequence,
      details: { ...rest, hearingDays, listedCases: !!rest.listedCase ? [rest.listedCase] : [] },
      instances,
      isMaster: instances >= 1,
      isChild: instances === undefined,
      isLastChild,
      rowIdentifier: generateId('allocated-hearing-row'),
      isDisabled: shouldDisableCheckbox(
        instances,
        isMultiDayMagistratesHearing,
        rest.hearingDayCount > 1 ? rest.startDate : startTime
      ),
      checkSplit: instances >= 1 ? canSplitHearing(rest.listedCase?.defendants) : undefined
    };
  });
}

export function normaliseCourtCalendarVariant(
  courtCalendarVariant: Partial<CourtRoomCalendarVM>
): CourtRoomCalendarVM;
export function normaliseCourtCalendarVariant(
  courtCalendarVariant: Partial<AllocationHearingsSectionVm>
): AllocationHearingsSectionVm;
export function normaliseCourtCalendarVariant(
  courtCalendarVariant: Partial<AllocatedWidgetCourtroomCalendarVm>
): AllocatedWidgetCourtroomCalendarVm;
export function normaliseCourtCalendarVariant(
  courtCalendarVariant: Partial<
    CourtRoomCalendarVM | AllocationHearingsSectionVm | AllocatedWidgetCourtroomCalendarVm
  >
): CourtRoomCalendarVM | AllocationHearingsSectionVm | AllocatedWidgetCourtroomCalendarVm {
  const normaliseJudicialCalendar = (calendar: Partial<CourtRoomCalendarVM>): CourtRoomCalendarVM =>
    ({
      ...calendar,
      judiciaryCalendar: calendar.judiciaryCalendar.map(judicialCal => ({
        ...judicialCal,
        hearingTimeCalendar: sortBy(
          judicialCal.hearingTimeCalendar.map(hearingCal => ({
            ...hearingCal,
            hearings: sortTimeCalendarHearingsByMasterAndSequence(hearingCal.hearings)
          })),
          c => new Date(c.time).getTime()
        )
      }))
    }) as CourtRoomCalendarVM;

  const normaliseAllocationCalendar = (
    calendar: Partial<AllocationHearingsSectionVm>
  ): AllocationHearingsSectionVm =>
    ({
      ...calendar,
      allocationCalendar: {
        ...calendar.allocationCalendar,
        hearingTimeCalendar: sortBy(
          calendar.allocationCalendar.hearingTimeCalendar?.map(hearingCal => ({
            ...hearingCal,
            hearings: sortTimeCalendarHearingsByMasterAndSequence(hearingCal.hearings)
          })),
          c => new Date(c.time).getTime()
        )
      }
    }) as AllocationHearingsSectionVm;

  const normaliseBusinessTypeCalendar = (
    calendar: Partial<AllocatedWidgetCourtroomCalendarVm>
  ): AllocatedWidgetCourtroomCalendarVm =>
    ({
      ...calendar,
      businessTypeCalendar: sortBy(
        calendar.businessTypeCalendar.map(businessTypeCal => ({
          ...businessTypeCal,
          sessions: businessTypeCal.sessions.map(session => ({
            ...session,
            judiciaryCalendar: session.judiciaryCalendar.map(judicialCal => ({
              ...judicialCal,
              hearingTimeCalendar: sortBy(
                judicialCal.hearingTimeCalendar.map(hearingCal => ({
                  ...hearingCal,
                  hearings: sortTimeCalendarHearingsByMasterAndSequence(hearingCal.hearings)
                })),
                c => new Date(c.time).getTime()
              )
            }))
          }))
        })),
        'businessType'
      )
    }) as AllocatedWidgetCourtroomCalendarVm;

  if ('judiciaryCalendar' in courtCalendarVariant) {
    return normaliseJudicialCalendar(courtCalendarVariant);
  }

  if ('allocationCalendar' in courtCalendarVariant) {
    return normaliseAllocationCalendar(courtCalendarVariant);
  }

  if ('businessTypeCalendar' in courtCalendarVariant) {
    return normaliseBusinessTypeCalendar(courtCalendarVariant);
  }
}

function getHearingTypeVm({ type, listedCase }: Partial<HearingForCaseInstance>): HearingTypeVM {
  return {
    description: type.description,
    markers: listedCase?.markers ?? [],
    hasReportingRestriction: (listedCase?.defendants ?? []).some(({ offences }) =>
      offences?.some(({ reportingRestrictions }) => reportingRestrictions?.length > 0)
    )
  };
}

function getDefendantsVM({
  listedCase,
  courtApplications
}: Partial<HearingForCaseInstance>): HearingDefendantVM {
  let defendantVm: HearingDefendantVM = {};
  if (!!listedCase) {
    defendantVm = {
      ...defendantVm,
      defendants: listedCase?.defendants ?? [],
      caseUrn: listedCase?.caseIdentifier?.caseReference,
      caseId: listedCase.id
    };
  } else if (courtApplications.length > 0) {
    const { applicationReference, id, applicant, respondents, applicationTypeCode } =
      courtApplications[0];
    defendantVm = {
      ...defendantVm,
      applicationId: id,
      applicationReference: applicationReference,
      applicationTypeCode: applicationTypeCode,
      applicationParties: {
        applicant:
          applicant.courtApplicationPartyType !== CourtApplicationPartyType.prosecution
            ? applicant
            : undefined,
        respondents: sortBy(
          respondents.filter(
            respondent =>
              respondent.courtApplicationPartyType !== CourtApplicationPartyType.prosecution
          ),
          'lastName'
        )
      }
    };
  }
  return defendantVm;
}

export function caseReferencesVM({
  listedCases,
  courtApplications
}: Partial<Hearing>): caseReferncesVM[] {
  let caseReferences: caseReferncesVM[];
  if (listedCases?.length > 0) {
    caseReferences = listedCases.map(caseItem => ({
      caseId: caseItem.id,
      caseUrn: caseItem.caseIdentifier?.caseReference || ''
    }));
  } else if (courtApplications?.length > 0) {
    caseReferences = courtApplications.map(application => ({
      applicationId: application.id,
      applicationReference: application.applicationReference || ''
    }));
  }
  return caseReferences;
}

export function sortTimeCalendarHearingsByMasterAndSequence(
  hearings: HearingRowVM[]
): HearingRowVM[] {
  const nextSequence = Math.max(...hearings.map(({ sequence }) => sequence)) + 1;
  return sortBy(
    hearings.reduce((sequencedHearings: HearingRowVM[], hearing, index) => {
      // We cater for Hearing view models that are simply case instances if multiple cases exist
      if (hearing.isMaster && hearing.instances > 1 && hearing.sequence === 0) {
        const childHearings = hearings.filter(({ id, isChild }) => id === hearing.id && !!isChild);
        return [
          ...sequencedHearings,
          ...[hearing, ...childHearings].map(h => {
            return { ...h, sequence: index + nextSequence };
          })
        ];
      }
      if (hearing.isMaster && hearing.instances > 1 && hearing.sequence !== 0) {
        const childHearings = hearings.filter(({ id, isChild }) => id === hearing.id && !!isChild);
        return [
          ...sequencedHearings,
          ...[
            hearing,
            ...childHearings.map(h => {
              return { ...h, sequence: hearing.sequence };
            })
          ]
        ];
      }
      if (hearing.isMaster && hearing.sequence === 0) {
        return [...sequencedHearings, { ...hearing, sequence: index + nextSequence }];
      }
      if (hearing.isMaster && hearing.sequence !== 0) {
        return [...sequencedHearings, hearing];
      }
      return sequencedHearings;
    }, []),
    'sequence'
  );
}

function getOffencesVM({
  listedCase,
  courtApplications
}: Partial<HearingForCaseInstance>): string[] {
  if (!!listedCase) {
    const offences = (listedCase?.defendants ?? []).reduce(
      (allOffences: Offence[], { offences }) => [...allOffences, ...offences],
      []
    );
    return uniq(
      sortBy(offences, 'count').map(({ statementOfOffence }) => statementOfOffence.title)
    );
  } else if (courtApplications.length > 0) {
    const applicationTypes = courtApplications.map(app => app.applicationType);
    return applicationTypes;
  }
}

function mapToHearingsForCaseInstances(hearings: Hearing[]): HearingForCaseInstance[] {
  return hearings.reduce((hearingsByCase: HearingForCaseInstance[], { listedCases, ...rest }) => {
    const cases = listedCases ?? [];
    if (cases.length === 0 && rest.courtApplications?.length > 0) {
      return [
        ...hearingsByCase,
        ...(rest.courtApplications ?? []).map((courtApplication, index) => ({
          ...rest,
          listedCase: undefined,
          courtApplications: [courtApplication],
          instances: index === 0 ? rest.courtApplications.length : undefined,
          isLastChild:
            rest.courtApplications?.length > 1
              ? index === rest.courtApplications.length - 1
              : undefined
        }))
      ];
    }
    return [
      ...hearingsByCase,
      ...cases.map((listedCase, index) => ({
        ...rest,
        courtApplications: rest.courtApplications?.filter(app =>
          app.linkedCaseIds.includes(listedCase.id)
        ),
        listedCase,
        instances: index === 0 ? cases.length : undefined,
        isLastChild: cases.length > 1 ? index === cases.length - 1 : undefined
      }))
    ];
  }, []);
}

function canSplitHearing(defendants: Defendant[]): boolean {
  return defendants?.length > 1 || defendants?.some(defendant => defendant.offences.length > 1);
}

function shouldDisableCheckbox(
  instances: number,
  isMultiDayMagistratesHearing: boolean,
  startTime: string
): boolean {
  if (instances < 1) {
    return undefined;
  }
  if (isMultiDayMagistratesHearing) {
    return true;
  }
  return !dateIsCurrentOrGreaterThan(startTime);
}
