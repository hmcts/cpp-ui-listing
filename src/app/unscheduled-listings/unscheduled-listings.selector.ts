import { createSelector } from '@ngrx/store';
import { getUnscheduledHearings, showUnscheduledHearings } from '../core/selectors';
import { getHasApiActivity } from '../core/selectors/api';
import {
  UnscheduledHearingsForAllApplications,
  UnscheduledHearingsForAllDefendants
} from './unscheduled-listings.interfaces';

export const getUnscheduledHearingsForAllDefendants = createSelector(
  getUnscheduledHearings,
  ({ hearings: unscheduledHearings }): UnscheduledHearingsForAllDefendants[] => {
    const defendantHearingsMap = new Map();
    unscheduledHearings.forEach((hearing) => {
      if ((hearing.courtApplications || []).length === 0) {
        hearing.listedCases.forEach((kase) =>
          kase.defendants.forEach((def) => {
            const newHearing = { ...hearing };
            const { id, firstName, lastName, dateOfBirth } = def;

            const defendantData = {
              defendantDetails: {
                id,
                firstName,
                lastName,
                dateOfBirth
              },
              urn: kase.caseIdentifier.caseReference,
              caseId: kase.id,
              hearings: [newHearing]
            };

            if (!defendantHearingsMap.has(id)) {
              defendantHearingsMap.set(id, defendantData);
            } else {
              defendantHearingsMap.get(id).hearings.push(newHearing);
            }
          })
        );
      }
    });

    return Array.from(defendantHearingsMap.values());
  }
);

export const getUnscheduledHearingsForAllApplications = createSelector(
  getUnscheduledHearings,
  ({ hearings: unscheduledHearings }): UnscheduledHearingsForAllApplications[] => {
    const applicationHearingsMap = new Map();
    unscheduledHearings.forEach((hearing) => {
      if ((hearing.courtApplications || []).length > 0) {
        hearing.courtApplications.forEach((application) => {
          const newHearing = { ...hearing };
          const { id, applicant, applicationReference } = application;

          const applicationData = {
            applicationDetails: {
              id,
              applicant
            },
            urn: applicationReference,
            hearings: [newHearing]
          };

          if (!applicationHearingsMap.has(id)) {
            applicationHearingsMap.set(id, applicationData);
          } else {
            applicationHearingsMap.get(id).hearings.push(newHearing);
          }
        });
      }
    });

    return Array.from(applicationHearingsMap.values());
  }
);

export const getUnscheduledHearingsCount = createSelector(
  getUnscheduledHearingsForAllDefendants,
  getUnscheduledHearingsForAllApplications,
  (unscheduledHearingsDefendants, unscheduledHearingsApplications): number => {
    return unscheduledHearingsDefendants.length + unscheduledHearingsApplications.length;
  }
);

export const showNoHearingsMessage = createSelector(
  showUnscheduledHearings,
  getUnscheduledHearingsForAllDefendants,
  getUnscheduledHearingsForAllApplications,
  getHasApiActivity,
  (showHearingList, unscheduledHearings, unscheduledHearingsApplications, loading): boolean =>
    showHearingList &&
    !unscheduledHearings.length &&
    !unscheduledHearingsApplications.length &&
    !loading
);
