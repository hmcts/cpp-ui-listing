import { JudicialRole, JudiciaryAssignmentSource } from './hearing';

export interface JudiciaryForHearings {
  hearings: string[];
  judiciary: JudicialRole[];
  judiciaryAssignmentSource?: JudiciaryAssignmentSource;
}
