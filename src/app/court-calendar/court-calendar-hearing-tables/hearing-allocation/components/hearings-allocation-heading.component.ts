import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { OrganisationUnit } from '@cpp/reference-data';
import { AllocationType } from '../../../model';
import { PdkCore } from '@cpp/pdk';

@Component({
  selector: 'allocation-hearings-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdkCore],
  inputs: ['courtCentre', 'allocationType'],
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (isUnallocated) {
      <h1 pdk-typography="heading-xlarge">
        Add unallocated hearings <span pdk-visually-hidden> in {{ courtCentre.oucodeL3Code }}</span>
      </h1>
    }
    @if (isReallocation) {
      <h1 pdk-typography="heading-xlarge">
        Reallocate hearings <span pdk-visually-hidden> in {{ courtCentre.oucodeL3Code }}</span>
      </h1>
    }
  `
})
export class AllocationHearingsHeadingComponent {
  courtCentre: OrganisationUnit;
  allocationType: AllocationType;

  get isReallocation() {
    return this.allocationType === AllocationType.reallocate;
  }

  get isUnallocated() {
    return this.allocationType === AllocationType.allocate;
  }
}
