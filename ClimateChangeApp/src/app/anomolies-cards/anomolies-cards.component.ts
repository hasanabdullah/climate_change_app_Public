  //external imports
  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { MatDialog } from '@angular/material'

  //local imports
  import { ClimateDataService } from 'src/app/services/climate-data.service';
  import { UserSelectionService } from 'src/app/services/user-selection.service';
  import { UserSelection } from 'src/app/classes/user-selection';
  import { DialogStormDetailsComponent } from '../dialog-storm-details/dialog-storm-details.component';
  import { iStormDetails } from '../classes/storm-details';
  


  @Component({
    selector: 'app-anomolies-cards',
    templateUrl: './anomolies-cards.component.html',
    styleUrls: ['./anomolies-cards.component.css']
  })
  export class AnomoliesCardsComponent implements OnInit, OnDestroy {
    doneLoadingDialog = false;
    //create an object for storm details with placeholders to store values from the query
    //source: https://stackoverflow.com/questions/14142071/typescript-and-field-initializers
    stormDetails: iStormDetails = {
      episode_id: -999,
      begin_date_time: '',
      end_date_time:'',
      injuries_direct: -999,
      injuries_indirect: -999,
      deaths_direct: -999,
      deaths_indirect: -999,
      damage_crops: -999,
      damage_property: -999,
      episode_narrative: "episode narrative",
      eventNarratives: [{state: "test state", location: "test location", narrative: "test narrative"}],
      location: "-999",
      prcp: -999,
      snow: -999,
      snwd: -999,
      tmax: -999,
      tmin: -999,
      totalInjuriesDirect: -999,
      totalInjuriesIndirect: -999,
      totalDeathsDirect: -999,
      totalDeathsIndirect: -999,
      totalInjuries: -999,
      totalDeaths: -999,
      totalCropDamages: -999,
      totalPropertyDamages: -999,
      flood_cause: "-999",
      event_type: "Hurricane Pete",
    }
    userSelection: UserSelection

    cards = [
      // { title: 'Card 1', cols: 2, rows: 1 },
      // { title: 'Temperature Anomaly', cols: 1, rows: 1,
      //   data: 'Loading...',
      //   image: "../../assets/images/hottestDay3.jpg",
      //   episodeId: 153 },

      { title: 'Drought', cols: 1, rows: 1,
        data: 'Loading...',
        image: "../../assets/images/drought1.png",
        episodeId: 153   },

      { title: 'Flood', cols: 1, rows: 1,
        data: 'Loading...',
        image: "../../assets/images/flood1.png",
        episodeId: 153  },

        { title: 'Tsunami', cols: 1, rows: 1,
        data: 'Loading...',
        image: "../../assets/images/tsunami2.jpg" ,
        episodeId: 153 },

      { title: 'Hurricane', cols: 1, rows: 1,
        data: 'Loading...',
        image: "../../assets/images/hurricane1.jpg",
        episodeId: 153  },

        { title: 'Tropical Storms', cols: 1, rows: 1,
        data: 'Loading...',
        image: "../../assets/images/tropicalStorm1.jpg",
        episodeId: 153  },

      { title: 'Tornado', cols: 1, rows: 1,
        data: 'Loading...',
        image: "../../assets/images/tornado2.png",
        episode_id: 153 
      },

      { title: 'Wildfire', cols: 1, rows: 1,
        data: 'Loading...',
        image: "../../assets/images/wildfire3.jpg",
        episodeId: 153  },

      { title: 'Blizzard', cols: 1, rows: 1,
        data: 'Loading...', 
        image: "../../assets/images/blizzard1.jpg",
        episodeId: 153 },

      { title: 'Ice Storm', cols: 1, rows: 1,
        data: 'Loading...', 
        image: "../../assets/images/iceStorm2.png",
        episodeId: 153 },

        { title: 'Lake Effect Snow', cols: 1, rows: 1,
        data: 'Loading...', 
        image: "../../assets/images/lakeEffectSnow2.jpg",
        episodeId: 153 },
    ];


    constructor(private climateDataService : ClimateDataService, private UserSelectionService: UserSelectionService, public dialog: MatDialog) {}
//have to use async so the function runs with the dialog opening
//source: https://stackoverflow.com/questions/53817629/wait-for-asynchronous-functions-to-finish-in-angular
    async openDialog(anomalyType){
      console.log('anom type:', anomalyType)
      await this.getStormDetailsData(anomalyType.episodeId)
      this.doneLoadingDialog = true;
      this.dialog.open(DialogStormDetailsComponent, {data: {stormDetails: this.stormDetails}});
    }


    async getStormDetailsData(episodeId){
      this.climateDataService.getStormDetails(episodeId)
      //subscribe to observable returned by the anomaly methood
        .subscribe(res =>{
          // data are the elements I am iterating over
          this.stormDetails.eventNarratives.pop();
          
              res.forEach(data =>{
                console.log('in dial for each: ', data)
                console.log('storm details', this.stormDetails)
                 this.stormDetails.episode_narrative = data.episode_narrative;
                 this.stormDetails.eventNarratives.push({state: data.state, location: data.location, narrative: data.event_narrative});
                 //this is not totalling correctly!!! how do I capture individual information
                 this.stormDetails.totalInjuriesDirect += data.injuries_direct;
                 this.stormDetails.totalInjuriesIndirect += data.injuries_indirect;
                 this.stormDetails.totalDeathsDirect = data.deaths_direct;
                 this.stormDetails.totalDeathsIndirect = data.deaths_indirect;
                 this.stormDetails.totalCropDamages = data.damage_crops;
                 this.stormDetails.totalPropertyDamages = data.damage_property;
                 this.stormDetails.flood_cause = data.flood_cause;
                 this.stormDetails.prcp = data.prcp;
                 this.stormDetails.snow = data.snow;
                 this.stormDetails.tmax = data.tmax;
                 this.stormDetails.tmin = data.tmin;
                 this.stormDetails.event_type = data.event_type;
                 this.stormDetails.episode_id = data.episode_id;
                 this.stormDetails.begin_date_time = data.begin_date_time;
                 this.stormDetails.end_date_time = data.end_date_time;
  
              })
  
              console.log('done in foreach: ', this.stormDetails.episode_narrative)
                  })
                  this.stormDetails.totalDeaths = this.stormDetails.totalDeathsDirect + this.stormDetails.totalDeathsIndirect
                  this.stormDetails.totalInjuries = this.stormDetails.totalInjuriesDirect + this.stormDetails.totalInjuriesIndirect
    }
    //list

    //get user selected data
    ngOnInit(){
      //binding to the actual observable
      this.UserSelectionService.userSelection$
      //observables have a method property .subscribe
        .subscribe(res =>{
          this.userSelection = res
          this.getData()
        })
    }
    getData(){
      //connected to the services specific anomaly function
      // this.climateDataService.getTempAnomaly(this.userSelection)
      // //subscribe to observable returned by the anomaly methood
      //   .subscribe(res =>{
      //         //push to cards
      //         this.cards[0].data = `Hottest Temperature: ${res[0].value} °C`;
      //         this.cards[0].episodeId = res[0].episode_id;
      // })
      
      this.climateDataService.getDroughtAnomaly(this.userSelection)
      //subscribe to observable returned by the anomaly methood
        .subscribe(res =>{
              //push to cards
              this.cards[1-1].data = `Longest Drought: ${res[0].value} days`;
              this.cards[1-1].episodeId = res[0].episode_id;
      })

      this.climateDataService.getFloodAnomaly(this.userSelection)
      //subscribe to observable returned by the anomaly methood
        .subscribe(res =>{
              //push to cards
              this.cards[2-1].data = `Total Precipitation: ${res[0].value} mm`;
              this.cards[2-1].episodeId = res[0].episode_id;
      })

      this.climateDataService.getTsunamiAnomaly(this.userSelection)
      //subscribe to observable returned by the anomaly methood
        .subscribe(res =>{
              //push to cards
              this.cards[3-1].data = `Highest Economics Impact: ${res[0].value} US dollars`;
              this.cards[3-1].episodeId = res[0].episode_id;
      })

      this.climateDataService.getHurricaneAnomaly(this.userSelection)
      //subscribe to observable returned by the anomaly methood
        .subscribe(res =>{
              //push to cards
              this.cards[4-1].data = `Most Deaths: ${res[0].value} deaths`;
              this.cards[4-1].episodeId = res[0].episode_id;
      })

      this.climateDataService.getTropicalStormAnomaly(this.userSelection)
      //subscribe to observable returned by the anomaly methood
        .subscribe(res =>{
              //push to cards
              this.cards[5-1].data = `Highest Economic Impact: ${res[0].value} US dollars`;
              this.cards[5-1].episodeId = res[0].episode_id;
      })

      this.climateDataService.getTornadoAnomaly(this.userSelection)
      //subscribe to observable returned by the anomaly methood
        .subscribe((res) =>{
              //push to cards
              console.log('in torn subscribe: ', res)
              
              
              this.cards[6-1].data = `Fujita Scale Rating: ${res[0].value}`;
              this.cards[6-1].episode_id = res[0].episode_id;
              
              console.log('torn ep id ', this.cards[0].episodeId)
      })

      this.climateDataService.getWildfireAnomaly(this.userSelection)
      //subscribe to observable returned by the anomaly methood
        .subscribe(res =>{
              //push to cards
              this.cards[7-1].data = `Longest Duration: ${res[0].value} days`;
              this.cards[7-1].episodeId = res[0].episode_id;
      })

      this.climateDataService.getBlizzardAnomaly(this.userSelection)
      //subscribe to observable returned by the anomaly methood
        .subscribe(res =>{
              console.log('results', res)
              //push to cards
              this.cards[8-1].data = `Snow depth: ${res[0].value} mm`;
              this.cards[8-1].episodeId = res[0].episode_id;
      })

      this.climateDataService.getIceStormAnomaly(this.userSelection)
      //subscribe to observable returned by the anomaly methood
        .subscribe(res =>{
              //push to cards
              this.cards[9-1].data = `Economic Impact: ${res[0].value} US dollars`;
              this.cards[9-1].episodeId = res[0].episode_id;
      })

      this.climateDataService.getLakeEffectSnowAnomaly(this.userSelection)
      //subscribe to observable returned by the anomaly methood
        .subscribe(res =>{
              //push to cards
              this.cards[10-1].data = `Snow Depth: ${res[0].value} mm`;
              this.cards[10-1].episodeId = res[0].episode_id;
      })
    }

    ngOnDestroy(){

    }




  }
