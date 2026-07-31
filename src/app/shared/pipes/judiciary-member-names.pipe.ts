import { Pipe, PipeTransform } from '@angular/core';
import { JudicialMemberNamePipe } from '@cpp/reference-data';
import { ExtendedJudicialRole } from '../../core';

@Pipe({ name: 'judiciaryMemberNames' })
export class JudiciaryMemberNamesPipe implements PipeTransform {
  constructor(private readonly judicialMemberNamePipe: JudicialMemberNamePipe) {}

  transform(judiciary: ExtendedJudicialRole[]) {
    return judiciary
      .filter((j) => !!j)
      .map((judicialRole) => this.judicialMemberNamePipe.transform(judicialRole.judicialMember))
      .join(', ')
      .replace(/,(?=[^,]*$)/, ' and');
  }
}
