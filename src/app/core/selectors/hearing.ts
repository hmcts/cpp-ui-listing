import { createSelector } from '@ngrx/store';
import { sortBy } from 'lodash-es';
import { AppState } from '../reducers';
import { Hearing, HearingByDefendants, ListedCase, PaginatedHearings } from '../model';
import moment from 'moment';
import { CaseNote } from '../../allocate-hearing/allocate-hearing.interfaces';

export const getUnallocatedHearings = (state: AppState) => [...state.hearings.unallocated.hearings];
export const getUnallocatedHearingsByPage = (state: AppState) => state.hearings.unallocated;

export const getUnallocatedHearingById = (id: string) => {
  return (state: AppState) =>
    state.hearings.unallocated.hearings.find((hearing) => hearing.id === id);
};

export const getHearingById = (id: string) =>
  createSelector(
    getUnallocatedHearings,
    getAllocatedHearings,
    (unAllocatedHearings: Hearing[] = [], allocatedHearings: Hearing[] = []) => {
      return [...unAllocatedHearings, ...allocatedHearings].find((hearing) => hearing.id === id);
    }
  );

export const getUnAllocatedCaseIds = createSelector(
  (state: AppState) => state.hearings.unallocated.hearings,
  (hearings, hearingId: string) => {
    if (hearings && Array.isArray(hearings)) {
      const hearing = hearings.find((hearing) => hearing.id === hearingId);
      if (hearing) {
        return (hearing.listedCases || []).map(({ id }) => id);
      }
    }
    return [];
  }
);

export const getUnAllocatedCasesPerHearing = createSelector(
  (state: AppState) => state.hearings.unallocated.hearings,
  (hearings, hearingId: string) => {
    if (hearings && Array.isArray(hearings)) {
      const hearing = hearings.find((hearing) => hearing.id === hearingId);
      if (hearing) {
        return hearing.listedCases || [];
      }
    }
    return [];
  }
);

export const getCaseNotesForHearing = createSelector(
  (state: AppState) => state.hearings.caseNotes,
  (caseNotes, hearingId: string) => {
    return caseNotes && caseNotes[hearingId];
  }
);

export interface AggregatedCaseNotes {
  caseDetails: ListedCase;
  caseNotes: CaseNote[];
}

export const getPinnedCaseNotesForHearing = createSelector(
  (state: AppState) => state.hearings.caseNotes,
  getUnAllocatedCasesPerHearing,
  (caseNotes, listedCases, hearingId: string): AggregatedCaseNotes[] => {
    if (caseNotes && caseNotes[hearingId]) {
      return listedCases
        .filter(
          ({ id }) =>
            !!caseNotes[hearingId][id] &&
            Object.values(caseNotes[hearingId][id]).some(({ isPinned }) => isPinned)
        )
        .map((listedCase) => {
          return {
            caseDetails: listedCase,
            caseNotes: caseNotes[hearingId][listedCase.id]
              .filter((item) => !!item.isPinned)
              .sort(
                (a, b) =>
                  new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime()
              )
          };
        });
    }
    return [];
  }
);

export const getAllocatedHearingById = (id: string) => {
  return (state: AppState) => state.hearings.allocated.find((hearing) => hearing.id === id);
};

export const getUnscheduledHearings = (state: AppState) => state.hearings.unscheduled;

export const getTypeOfList = (state: AppState) => state.hearings.typeOfList;

export const getAllocatedHearings = (state: AppState) => state.hearings.allocated;

export const getPagedCourtList = (state: AppState) => state.hearings.hearingCourtList;

export const getLastAllocatedHearing = (state: AppState) => state.hearings.lastAllocatedHearing;

export const getSelectedRestrictedHearing = (state: AppState) => state.hearings.restrictedHearing;

export const getScheduledHearingForAllocation = (state: AppState) =>
  state.hearings.scheduledHearingForAllocation;

export const isScheduledAllocatedHearingStandaloneApplication = createSelector(
  getScheduledHearingForAllocation,
  (hearing) =>
    !!hearing &&
    (!hearing.listedCases || (!!hearing.listedCases && hearing.listedCases.length === 0))
);

export const isScheduledAllocatedHearingOnlyWithLinkedApplication = createSelector(
  getScheduledHearingForAllocation,
  (hearing) => {
    if (!hearing) {
      return false;
    }

    const { courtApplications, listedCases } = hearing;
    return (
      !!courtApplications &&
      courtApplications.length === 1 &&
      !!listedCases &&
      listedCases.length === 1 &&
      !!courtApplications[0].linkedCaseIds &&
      !!listedCases[0].id &&
      courtApplications[0].linkedCaseIds.includes(listedCases[0].id)
    );
  }
);

export const getAvailableHearings = (state: AppState) => state.hearings.available;

export const getTodaysHearing = createSelector(getAllocatedHearings, (hearings) => {
  const today = moment();
  return hearings.filter((hearing) =>
    hearing.hearingDays.some((day) => moment(day.hearingDate).isSame(today, 'day'))
  );
});

export const getTodaysHearingIds = createSelector(getTodaysHearing, (hearings) =>
  hearings.map(({ id }) => id)
);

export const filterUrns = (hearings?: Hearing[]) =>
  (hearings || []).reduce((urns, hearing) => {
    return [
      ...urns,
      ...(hearing.listedCases || []).map(({ caseIdentifier }) => caseIdentifier.caseReference),
      ...(hearing.courtApplications || []).map((app) => app.applicationReference)
    ];
  }, []);

export const getTodaysHearingUrns = createSelector(getTodaysHearing, filterUrns);

export const getRestrictExpandstatus = (state: AppState) =>
  state.hearings.restrictListExpanded || {};

export const getWeekCommencingHearings = (state: AppState) => state.hearings.weekcommencingHearing;

export const getPublishCourtListStatuses = (state: AppState) =>
  state.hearings.publishCourtListStatuses;

export const getLastAllocatedMagsHearing = (state: AppState) => {
  return {
    hearing: state.hearings.scheduledHearingForAllocation,
    availableHearing: false
  };
};

export const getMagsHearingSchedule = (state: AppState) => state.hearings.hearingSchedule;

export const getHearingByDefendantsGroup = (id: string) =>
  createSelector(
    getHearingById(id),
    getScheduledHearingForAllocation,
    (unallocatedHearing: Hearing, scheduledHearing: Hearing): HearingByDefendants => {
      const prosecutionCases = unallocatedHearing.listedCases || [];
      const allScheduledDefendants = (
        (scheduledHearing && scheduledHearing.listedCases) ||
        []
      ).reduce(
        (scheduledDefendants, currentKase) => scheduledDefendants.concat(currentKase.defendants),
        []
      );

      const hasDefendantChecked = (currentDefendant) => {
        if (scheduledHearing) {
          const selectedDefendant = allScheduledDefendants.find(
            (def) => def.id === currentDefendant.id
          );
          return (
            selectedDefendant &&
            currentDefendant.offences.length === selectedDefendant.offences.length
          );
        }
        return false;
      };

      const hasOffenceChecked = (currentOffence, currentDefendant) => {
        if (scheduledHearing) {
          const selectedDefendant = allScheduledDefendants.find(
            (def) => def.id === currentDefendant.id
          );
          return (
            selectedDefendant &&
            !!selectedDefendant.offences.find((off) => off.id === currentOffence.id)
          );
        }
        return false;
      };

      const allDefendantsSortedByCourtProceedingsInitiated = prosecutionCases
        .reduce((defendants, currentCase) => defendants.concat(currentCase.defendants), [])
        .sort((firstDefendant, secondDefendant) => {
          return firstDefendant.courtProceedingsInitiated >
            secondDefendant.courtProceedingsInitiated
            ? -1
            : 1;
        });

      const allDefendantsToBeDisplayed = [];

      for (const defendant of allDefendantsSortedByCourtProceedingsInitiated) {
        if (
          !allDefendantsToBeDisplayed.find(
            (def) => def.masterDefendantId === defendant.masterDefendantId
          ) &&
          !allDefendantsToBeDisplayed.find((def) => def.id === defendant.masterDefendantId) &&
          !allDefendantsToBeDisplayed.find((def) => def.masterDefendantId === defendant.id)
        ) {
          allDefendantsToBeDisplayed.push({
            ...defendant,
            checked: hasDefendantChecked(defendant)
          });
        }
      }

      const defendantsGrouped = [];

      for (const defendant of allDefendantsToBeDisplayed) {
        const defendantCases = [];

        for (const kase of prosecutionCases) {
          let newCase;
          if (
            kase.defendants.some(
              (defendantFromCase) =>
                defendantFromCase.masterDefendantId === defendant.masterDefendantId ||
                defendantFromCase.id === defendant.masterDefendantId ||
                defendantFromCase.masterDefendantId === defendant.id
            )
          ) {
            newCase = { ...kase };
            delete newCase.defendants;

            const caseDefendant = kase.defendants.find(
              (defendantFromCase) =>
                defendantFromCase.masterDefendantId === defendant.masterDefendantId ||
                defendantFromCase.id === defendant.masterDefendantId ||
                defendantFromCase.masterDefendantId === defendant.id
            );

            newCase.defendantId = caseDefendant.id;
            newCase.offences = sortBy(caseDefendant.offences, ['count']);

            const offencesWithFlag = newCase.offences.map((off) => ({
              ...off,
              visible: false,
              checked: hasOffenceChecked(off, caseDefendant)
            }));
            newCase.offences = offencesWithFlag;
            defendantCases.push(newCase);
            continue;
          }
        }

        const groupedDefendant = { ...defendant };
        delete groupedDefendant.offences;

        defendantsGrouped.push({
          ...groupedDefendant,
          prosecutionCases: defendantCases
        });
      }

      return {
        hearingId: id,
        defendantByCases: defendantsGrouped
      };
    }
  );

export const hasAllocatedHearingsByDateRange = createSelector(
  getPagedCourtList,
  (hearingCourtList: PaginatedHearings) => {
    return hearingCourtList?.hearings?.length > 0 ? true : false;
  }
);

export const hasSplitHearingFromUnallocated = (state: AppState) =>
  state.hearings.hasSplitHearingFromUnallocated;

export const getEditAllocationError = (state: AppState) => state.hearings.editAllocationError;
export const getHearingToEditAllocation = (state: AppState) =>
  state.hearings.hearingToEditAllocation;
