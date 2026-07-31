import { Pipe, PipeTransform } from '@angular/core';
import { Defendant } from '../../core/';
import { first, sortBy } from 'lodash-es';

@Pipe({ name: 'findFirstDefendantAlphabetically' })
export class FindFirstDefendantAlphabeticallyPipe implements PipeTransform {
  transform(defendants: Defendant[]): Defendant {
    return first(sortBy(defendants, ['organisationName', 'firstName']));
  }
}
