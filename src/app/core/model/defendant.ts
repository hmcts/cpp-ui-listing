import { Offence } from './offence';
import { Address } from './court-application';

export interface Defendant {
  id: string;
  datesToAvoid?: string;
  hearingLanguageNeeds?: string;
  specificRequirements?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  custodyTimeLimit?: string;
  organisationId?: string;
  organisationName?: string;
  defenceOrganisation?: string;
  offences: Offence[];
  bailStatus: BailStatus;
  restrictFromCourtList?: boolean;
  isYouth?: boolean;
  masterDefendantId?: string;
  courtProceedingsInitiated?: string;
  address?: Address;
}

export interface BailStatus {
  id: string;
  code: string;
  description: string;
  custodyTimeLimit: string;
}
