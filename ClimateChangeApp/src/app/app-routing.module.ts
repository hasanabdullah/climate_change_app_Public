import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClimateDashboardComponent } from './climate-dashboard/climate-dashboard.component';
import { StormEventsComponent } from './storm-events/storm-events.component';
import { ClimateAnomaliesComponent } from './climate-anomalies/climate-anomalies.component';


const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ClimateDashboardComponent },
  { path: 'anomalies', component: ClimateAnomaliesComponent },
  { path: 'storm-events', component: StormEventsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
