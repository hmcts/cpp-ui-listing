import { CourtApplication, Defendant, Hearing } from '../core/model';

export interface TypeOfListOptions {
  id: string;
  description: string;
}

export interface OrganisationUnitSummary {
  id: string;
  name: string;
  courtCentreId?: string;
  courtCentreName?: string;
}

export interface TypeOfListSummary {
  value: string;
  label: string;
}

export interface UnscheduledHearingsForAllDefendants {
  defendantDetails: Pick<Defendant, 'id' | 'dateOfBirth' | 'firstName' | 'lastName'>;
  urn: string;
  caseId: string;
  hearings: Hearing[];
}

export interface UnscheduledHearingsForAllApplications {
  applicationDetails: Pick<CourtApplication, 'id' | 'applicant'>;
  urn: string;
  hearings: Hearing[];
}
