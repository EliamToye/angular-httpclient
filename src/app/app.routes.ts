import { Routes } from '@angular/router';
import { FetchComponent } from './fetch/fetch.component';
import { ConfigurationComponent } from './configuration/configuration.component'; // Import ConfigurationComponent

export const routes: Routes = [
  { path: 'fetch', component: FetchComponent }, // Use FetchComponent, not fetch
  { path: 'configuration', component: ConfigurationComponent }, // Add the route for Configuration page
  { path: '', redirectTo: '/fetch', pathMatch: 'full' } // Fix default route to point to '/fetch'
];