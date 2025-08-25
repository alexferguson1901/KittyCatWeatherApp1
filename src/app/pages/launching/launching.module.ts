import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LaunchingPageRoutingModule } from './launching-routing.module';

import { LaunchingPage } from './launching.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LaunchingPageRoutingModule
  ],
  declarations: [LaunchingPage]
})
export class LaunchingPageModule {}
