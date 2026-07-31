import { HearingType, OrganisationUnit, Prosecutor } from '@cpp/reference-data';
import { createSelector } from '@ngrx/store';
import { CourtCentre } from '../model';
import { AppState } from '../reducers';

export const getReferenceDataHearingTypes = (state: AppState) =>
  state.referenceData && state.referenceData.hearingTypes;

export const getHearingTypes = createSelector(getReferenceDataHearingTypes, (hearingTypes) =>
  hearingTypes.map(mapHearingTypes)
);

export const getReferenceDataHearingTypeById = (id: string) => {
  return createSelector(getReferenceDataHearingTypes, (hearingTypes: HearingType[]) =>
    hearingTypes.find((ht) => ht.id === id)
  );
};

export const getProsecutors = createSelector(
  (state: AppState) => state.referenceData.prosecutors || [],
  (prosecutors) => prosecutors.map(mapProsecutors)
);

export const getCourtCentres = createSelector(
  (state: AppState) => (state.referenceData && state.referenceData.organisationUnits) || [],
  (organisationUnits) => organisationUnits.map(mapOrganisationUnitToCourtCentres)
);

export const getCrownCourtCentres = (state: AppState) => {
  return state.referenceData.organisationUnits
    .filter((ou) => ou.oucodeL1Code === 'C')
    .map(mapOrganisationUnitToCourtCentres);
};

export const getCourtSummaries = createSelector(getCourtCentres, (courtCentres) => {
  if (!courtCentres) {
    return [];
  }
  return courtCentres.map((cc) => ({ id: cc.id, name: cc.name }));
});

export const mapOrganisationUnitToCourtCentres = (org: OrganisationUnit): CourtCentre => {
  return {
    id: org.id,
    name: org.oucodeL3Name,
    oucode: org.oucode,
    courtCode: org.oucodeL1Code,
    defaultStartTime: org.defaultStartTime,
    defaultDuration: org.defaultDurationHrs,
    courtRooms: org.courtrooms
      ? org.courtrooms.map((cr) => ({ id: cr.id, name: cr.courtroomName }))
      : []
  };
};

export const mapHearingTypes = (hearingType: HearingType) => ({
  id: hearingType.id,
  name: hearingType.hearingDescription,
  defaultDurationMin: hearingType.defaultDurationMin
});

export const mapProsecutors = (prosecutor: Prosecutor) => ({
  id: prosecutor.id,
  name: prosecutor.shortName
});

export const getTrialTypes = (state: AppState) => state.referenceData.trialTypes;

export const getJudiciaries = (state: AppState) => state.listingReferenceData.judiciaries;

export const getTrialTypesFilteredByType = createSelector(getTrialTypes, (trialTypes) => {
  return [...(trialTypes ?? [])]
    .filter((trialType) => trialType.trialType === 'Vacated')
    .sort((a, b) => (a.seqNo > b.seqNo ? 1 : -1))
    .map((trialType) => {
      return {
        ...trialType,
        label: trialType.reasonShortDescription,
        value: trialType.id
      };
    });
});
