import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js';

import { ClimateDataService } from '../../services/climate-data.service';
import { UserSelectionService } from 'src/app/services/user-selection.service';
import { UserSelection } from 'src/app/classes/user-selection';
import { STATE_LIST } from 'src/app/classes/state-list';

@Component({
  selector: 'chart-precip',
  templateUrl: './chart-precip.component.html',
  styleUrls: ['./chart-precip.component.css']
})
export class ChartPrecipComponent implements OnInit, OnDestroy {
  chart = [];
  datax = [];
  datay = [];
  data = [];
  state: string;
  userSelection: UserSelection //= new UserSelection('New York', '1990-01-01', '2003-03-03')

  constructor(private climateDataService : ClimateDataService, private UserSelectionService: UserSelectionService) { }

  /** Gets the data from the climate data service and builds a graph with it. */
  getData(): void {
    /*
    Climate data service is used to get data from the back end
    It makes the calls to the database and then will distribute the returned data to the subscribers (charts) when
    They ask for it.
    */
    this.climateDataService.getPrecipitationData(this.userSelection)
      .subscribe(res => {
        
        console.log('precip results:')
        console.log(res)
        this.data = res;
        this.datax = [];
        this.datay = [];

        res.forEach(row => {
          // this.datax.push(row.date_time);
          // this.datay.push(row.tmax)
          this.datax.push(row.x);
          this.datay.push(row.y)
        })

        this.buildGraph();

      });

  }

  ngOnInit() {
    // The selection form will push the selection data to all subscribers (charts) whenever new data is submitted
    this.UserSelectionService.userSelection$
      .subscribe(selection => {
        // The chart got a new user selection, so store it and make a call to the backend with the new selection
        // and build a new graph with the resulting data.
        STATE_LIST.forEach(s => {
          if (s.stateCode === selection.state){
            this.state = s.stateName
          }
        });

        this.userSelection = selection;
        this.getData() 
      }) 

    // Initialize the graph on load (Eventually this can be changed to geolocate the user to auto graph their state info on load)
    //this.getData();
    
  }

  /** This function builds a new graph with the current x and y data held by the component. */
  buildGraph(){
    console.log('data precip : ')
    console.log(this.datax)
    console.log(this.datay)
    this.chart = new Chart('canvas2', { 
      type: "line", 
      data: { 
        labels: this.datax,
        datasets: [
          { 
            // label: "Precipitation", 
            data: this.datay, 
            fill: false, 
            borderColor: "rgb(75, 192, 192)", 
            lineTension: 0.1,
            pointRadius: 0,
            pointBorderWidth: 0 
          }
        ] 
      }, 
      options: {
        legend: {
          display: false,
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Precipitation (mm)'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Date'
            }
          }]
        }
      } 
    });
  }


  ngOnDestroy(){}

}

