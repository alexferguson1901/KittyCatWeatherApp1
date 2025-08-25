import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'launching', // Redirect the root path to the launching page
    pathMatch: 'full'
  },
  {
    path: 'launching',
    loadComponent: () => import('./pages/launching/launching.page').then(m => m.LaunchingPage) // Load the launching page
  },
  {
    path: 'loading',
    loadComponent: () => import('./pages/loading/loading.page').then(m => m.LoadingPage) // Load the loading page
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
 
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }