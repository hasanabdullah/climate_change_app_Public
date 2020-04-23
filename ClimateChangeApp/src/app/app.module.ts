// External imports
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
//for backend
import { HttpClientModule } from '@angular/common/http';

// Internal imports
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { ClimateDashboardComponent } from './climate-dashboard/climate-dashboard.component';
import { ClimateAnomaliesComponent } from './climate-anomalies/climate-anomalies.component';
import { StormEventsComponent } from './storm-events/storm-events.component';
import { SelectionFormComponent } from './selection-form/selection-form.component';
import { ChartsModule } from './charts/charts.module'
import { ChartTempComponent } from './charts/chart-temp/chart-temp.component'
import { ChartPrecipComponent } from './charts/chart-precip/chart-precip.component';
import { AnomoliesCardsComponent } from './anomolies-cards/anomolies-cards.component';
import { DialogStormDetailsComponent } from './dialog-storm-details/dialog-storm-details.component';
import { ClimateDataService } from 'src/app/services/climate-data.service';


@NgModule({
  declarations: [
    AppComponent,
    ClimateDashboardComponent,
    ClimateAnomaliesComponent,
    StormEventsComponent,
    SelectionFormComponent,
    ChartTempComponent,
    ChartPrecipComponent,
    AnomoliesCardsComponent,
    DialogStormDetailsComponent,
  ],
  entryComponents: [DialogStormDetailsComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    
    // Should be importing ChartsModule here and not LineChart1 in declarations/top import statement. That approach had been 
    // working and then it randomly stopped working (I literally just loaded a previous project to check something, then swtiched
    // back to this project in VS Code and it no longer worked). I have used this strange workaround where I am declaring 
    // LineChart1 here but that feels weird and wrong
  ],
  providers: [ClimateDataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
