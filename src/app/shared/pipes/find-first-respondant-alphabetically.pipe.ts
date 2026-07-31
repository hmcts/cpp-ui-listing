import { Pipe, PipeTransform } from '@angular/core';
import { ApplicantRespondent } from '../../core';
import { first, sortBy } from 'lodash-es';

@Pipe({ name: 'findFirstApplicantRespondantAlphabetically' })
export class FindFirstApplicantRespondantAlphabeticallyPipe implements PipeTransform {
  transform(applicantsOrRespondants: ApplicantRespondent[]): ApplicantRespondent {
    return first(sortBy(applicantsOrRespondants, 'lastName'));
  }
}
