import { NgModule } from '@angular/core';

import { ChartTempComponent } from './chart-temp/chart-temp.component';
import { ChartPrecipComponent } from './chart-precip/chart-precip.component';
import { ChartStormCountComponent } from './chart-storm-count/chart-storm-count.component';


@NgModule({
  
  // Should only be declaring LineChart1 here, I shouldn't need to export it because I should be able to import ChartsModule 
  // in AppModule and then get access to LineChart1 because it is declared here. That method previously worked and randomly
  // stopped working. (I literally just loaded a previous project to check something, and then loaded back into this one
  // and it no longer worked.)Now it says error: line-chart1 is not a known element. This is a weird work around that I don't 
  // even really understand why it works.
  declarations: [ChartTempComponent, ChartPrecipComponent, ChartStormCountComponent], 
  imports: [
    
  ],
  exports: [
    ChartTempComponent,
    ChartPrecipComponent
    
  ]
})
export class ChartsModule { }
