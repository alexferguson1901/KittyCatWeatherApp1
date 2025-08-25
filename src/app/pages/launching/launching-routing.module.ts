import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LaunchingPage } from './launching.page';

const routes: Routes = [
  {
    path: '',
    component: LaunchingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LaunchingPageRoutingModule {}
