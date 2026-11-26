import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChangeCourtroomStore } from '../component-store/change-courtroom.store';
import { PdkGrid } from '@cpp/pdk';

@Component({
  selector: 'change-courtroom-container',
  template: `
    <pdk-grid container>
      <pdk-grid full>
        <router-outlet></router-outlet>
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [PdkGrid, RouterOutlet],
  providers: [ChangeCourtroomStore]
})
export class ChangeCourtroomContainer {}
