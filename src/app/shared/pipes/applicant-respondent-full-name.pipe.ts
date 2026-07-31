import { Pipe, PipeTransform } from '@angular/core';
import { ApplicantRespondent } from '../../core';

@Pipe({ name: 'applicantRespondentFullName' })
export class ApplicantRespondentFullNamePipe implements PipeTransform {
  transform(applicantRespondent: ApplicantRespondent, attribute: string = null): string {
    if (!applicantRespondent) {
      return '';
    }
    switch (attribute) {
      case 'firstName':
        return (
          applicantRespondent.firstName.charAt(0).toUpperCase() +
          applicantRespondent.firstName.slice(1).toLowerCase()
        );
      case 'lastName':
        return applicantRespondent.lastName.toUpperCase();
      default:
        return applicantRespondent.firstName
          ? applicantRespondent.firstName.charAt(0).toUpperCase() +
              applicantRespondent.firstName.slice(1).toLowerCase() +
              ' ' +
              applicantRespondent.lastName.toUpperCase()
          : applicantRespondent.lastName.toUpperCase();
    }
  }
}
