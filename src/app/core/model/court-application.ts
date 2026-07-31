import { Defendant } from './defendant';

export interface AssociatedPerson {
  role: string;
  person: Person;
}

export interface Address {
  address1: string;
  address2?: string;
  address3?: string;
  address4?: string;
  address5?: string;
  postcode: string;
}

export interface Contact {
  work?: string;
  home?: string;
  mobile?: string;
  primaryEmail?: string;
  secondaryEmail?: string;
  fax?: string;
}

export interface ApplicationParty {
  id: string;
  synonym?: string;
  personDetails?: Person;
  organisation?: Organisation;
  organisationPersons?: AssociatedPerson[];
  prosecutingAuthority?: ProsecutionAuthority;
  defendant?: Defendant;
  representationOrganisation?: Organisation;
  firstName?: string;
  lastName?: string;
}

export interface ApplicationPayment {
  isFeePaid: boolean;
  isFeeUndertakingAttached: boolean;
  isFeeExempt: boolean;
  paymentReference: string;
}

export interface ApplicationType {
  id: string;
  applicationCode: string;
  applicationType: string;
  applicationTypeWelsh?: string;
  applicationLegislation: string;
  applicationLegislationWelsh?: string;
  applicationCategory: string;
  linkType: string;
  applicantSynonym?: string;
  respondentSynonym?: string;
  applicationJurisdictionType: string; // MAGISTRATES, CROWN, EITHER
  isTimeRestricted: boolean;
  applicationSummonsRecipientType?: string;
}

export interface ApplicationResponseType {
  id: string;
  sequence: number;
  description: string;
}

export interface ApplicationResponse {
  originatingHearingId: string;
  applicationId: string;
  applicationResponseDate: string;
  applicationResponseType: ApplicationResponseType;
}

export interface ApplicantRespondent {
  firstName?: string;
  lastName: string;
  isRespondent: boolean;
  id?: string;
  courtApplicationPartyType?: CourtApplicationPartyType;
  restrictFromCourtList?: boolean;
}

export interface ApplicationOutComeType {
  id: string;
  sequence: number;
  description: string;
}

export interface ApplicationOutCome {
  originatingHearingId: string;
  applicationId: string;
  applicationOutcomeDate: string;
  applicationOutcomeType: ApplicationOutComeType;
}

export interface CourtApplication {
  id: string;
  linkedCaseIds: string[];
  parentApplicationId?: string;
  respondents?: ApplicantRespondent[];
  applicant: ApplicantRespondent;
  applicationType: string;
  applicationTypeCode?: string;
  restrictFromCourtList?: boolean;
  restrictCourtApplicationType?: boolean;
  applicationReference?: string;
  subject?: ApplicantRespondent;
}

export interface CourtApplicationSummary {
  applicationId: string;
  applicationTitle: string;
  applicationReference: string;
  applicationStatus: string; // DRAFT, LISTED, FINALISED
  applicantDisplayName: string;
  respondentDisplayNames?: string;
}

export interface DelegatedPowers {
  userId: string;
  firstName: string;
  lastName: string;
}

export interface JudicialResult {
  orderedHearingId: string;
  label: string;
  welshLabel?: string;
  isAdjournmentResult: boolean;
  isFinancialResult: boolean;
  isConvictedResult?: boolean;
  isAvailableForCourtExtract: boolean;
  amendmentDate?: boolean;
  cjsCode?: string;
  rank?: number;
  orderedDate?: string;
  lastSharedDateTime?: string;
  courtClerk?: DelegatedPowers;
  delegatedPowers?: DelegatedPowers;
  fourEyesApproval?: DelegatedPowers;
  approvedDate?: string;
  usergroups?: string[];
  category: string; // FINAL, INTERMEDIARY, ANCILLARY
  judicialResultPrompts?: JudicialResultPrompt;
}

export interface JudicialResultPrompt {
  label: string;
  welshLabel?: string;
  value?: string;
  promptSequence?: number;
  promptReference?: string;
}

export interface Organisation {
  id?: string;
  name: string;
  incorporationNumber?: string;
  registeredCharityNumber?: string;
  address?: Address;
  contact?: Contact;
}

export interface Person {
  id?: string;
  title?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  nationalityId: string;
  nationalityCode: string;
  nationalityDescription: string;
  additionalNationalityId: string;
  additionalNationalityCode?: string;
  additionalNationalityDescription?: string;
  disabilityStatus?: string;
  ethnicityId: string;
  ethnicityCode?: string;
  ethnicityDescription?: string;
  gender: string;
  interpreterLanguageNeeds?: string;
  documentationLanguageNeeds?: string;
  nationalInsuranceNumber?: string;
  occupation?: string;
  occupationCode?: string;
  specificRequirements?: string;
  address: Address;
  contact: Contact;
}

export interface ProsecutionAuthority {
  prosecutionAuthorityId: string;
  prosecutionAuthorityCode: string;
  name?: string;
  accountCode?: string;
  address?: Address;
  contact?: Contact;
}

export enum CourtApplicationPartyType {
  Person = 'PERSON',
  Organisation = 'ORGANISATION',
  prosecution = 'PROSECUTING_AUTHORITY',
  personDefendant = 'PERSON_DEFENDANT',
  organisationDefendant = 'ORGANISATION_DEFENDANT'
}
