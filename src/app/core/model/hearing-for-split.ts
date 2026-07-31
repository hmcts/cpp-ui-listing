import { StatementOfOffence } from './offence';
import { CaseIdentifier } from './hearing';

export interface SplittedHearingIds {
  caseIds: string[];
  defendantIds: string[];
  offenceIds: string[];
}

export interface HearingByDefendants {
  hearingId: string;
  defendantByCases?: DefendantByCases[];
}

export interface DefendantByCases {
  id: string;
  firstName?: string;
  lastName?: string;
  checked?: boolean;
  masterDefendantId?: string;
  prosecutionCases?: ProsecutionCaseDetails[];
}

export interface ProsecutionCaseDetails {
  id: string;
  defendantId?: string;
  caseIdentifier?: CaseIdentifier;
  offences?: OffenceForSplit[];
}

export interface OffenceForSplit {
  id: string;
  offenceWording?: string;
  statementOfOffence?: StatementOfOffence;
  checked?: boolean;
  visible?: boolean;
}
