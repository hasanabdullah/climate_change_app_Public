import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { iClimateData } from '../classes/climate-data';
import { UserSelection } from '../classes/user-selection';
import { iAnomoliesData } from '../classes/anomolies-data';
import { iStormDetails } from '../classes/storm-details';

//file that calls methods to connect to the backend and return the right datatype. 
//injectable "root" allows 
@Injectable({
  //data provided into root, then accessible to the rest of the app, but still needs to be accessed.
  providedIn: 'root'
})

/**
 * The Climate Data Service will make all the calls to the back end API to get data from the database.
 * Then it can distribute the appropriate data to the charts when they ask for it.
 */
export class ClimateDataService implements OnInit{
  //is this anything? or is the url we are specifying for pulling data from backend
  private climateURL = 'http://localhost:8081/'
  
  constructor(private http: HttpClient) { }

  ngOnInit() {

  }

  // Get the max temp data for the state over the time period
  getTempData(userSelection: UserSelection): Observable<iClimateData[]> {
    console.log('in Service')
    console.log(userSelection)
    return this.http.get<iClimateData[]>(this.climateURL + `getMaxTemperature/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  // Get the average precipitation data for the state over the time period
  getPrecipitationData(userSelection: UserSelection): Observable<iClimateData[]> {
    console.log('in Service')
    console.log(userSelection)
    return this.http.get<iClimateData[]>(this.climateURL + `getPrecipitation/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  // Get count of storm details by episode_id to display count with event type
  getStormCount(userSelection: UserSelection): Observable<iClimateData[]> {
    console.log('hasan is awsesome')
    console.log(userSelection)
    return this.http.get<iClimateData[]>(this.climateURL + `getStormCount/${userSelection.state}&${userSelection.startDate}$${userSelection.endDate}`)
  }



  //method(parameters): return type
  getDroughtAnomaly(userSelection: UserSelection): Observable<iAnomoliesData>{
    console.log('in Service')
    console.log(userSelection)
    //getTempAnomaly below has to match the backend url
    return this.http.get<iAnomoliesData>(this.climateURL + `getDroughtAnomaly/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  getFloodAnomaly(userSelection: UserSelection): Observable<iAnomoliesData>{
    console.log('in Service')
    console.log(userSelection)
    //getTempAnomaly below has to match the backend url
    return this.http.get<iAnomoliesData>(this.climateURL + `getFloodAnomaly/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  getTsunamiAnomaly(userSelection: UserSelection): Observable<iAnomoliesData>{
    console.log('in Service')
    console.log(userSelection)
    //getTempAnomaly below has to match the backend url
    return this.http.get<iAnomoliesData>(this.climateURL + `getTsunamiAnomaly/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  getHurricaneAnomaly(userSelection: UserSelection): Observable<iAnomoliesData>{
    console.log('in Service')
    console.log(userSelection)
    //getTempAnomaly below has to match the backend url
    return this.http.get<iAnomoliesData>(this.climateURL + `getHurricaneAnomaly/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  getTropicalStormAnomaly(userSelection: UserSelection): Observable<iAnomoliesData>{
    console.log('in Service')
    console.log(userSelection)
    //getTempAnomaly below has to match the backend url
    return this.http.get<iAnomoliesData>(this.climateURL + `getTropicalStormAnomaly/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  getTornadoAnomaly(userSelection: UserSelection): Observable<iAnomoliesData>{
    console.log('in Service')
    console.log(userSelection)
    //getTempAnomaly below has to match the backend url
    return this.http.get<iAnomoliesData>(this.climateURL + `getTornadoAnomaly/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  getWildfireAnomaly(userSelection: UserSelection): Observable<iAnomoliesData>{
    console.log('in Service')
    console.log(userSelection)
    //getTempAnomaly below has to match the backend url
    return this.http.get<iAnomoliesData>(this.climateURL + `getWildfireAnomaly/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  getBlizzardAnomaly(userSelection: UserSelection): Observable<iAnomoliesData>{
    console.log('in Service')
    console.log(userSelection)
    //getTempAnomaly below has to match the backend url
    return this.http.get<iAnomoliesData>(this.climateURL + `getBlizzardAnomaly/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  getIceStormAnomaly(userSelection: UserSelection): Observable<iAnomoliesData>{
    console.log('in Service')
    console.log(userSelection)
    //getTempAnomaly below has to match the backend url
    return this.http.get<iAnomoliesData>(this.climateURL + `getIceStormAnomaly/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  getLakeEffectSnowAnomaly(userSelection: UserSelection): Observable<iAnomoliesData>{
    console.log('in Service')
    console.log(userSelection)
    //getTempAnomaly below has to match the backend url
    return this.http.get<iAnomoliesData>(this.climateURL + `getLakeEffectSnowAnomaly/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  getTempAnomaly(userSelection: UserSelection): Observable<iAnomoliesData>{
    console.log('in Service')
    console.log(userSelection)
    //getTempAnomaly below has to match the backend url
    return this.http.get<iAnomoliesData>(this.climateURL + `getTempAnomaly/${userSelection.state}&${userSelection.startDate}&${userSelection.endDate}`)
  }

  //function to get storm details for feature 3
  getStormDetails(episode_id): Observable<iStormDetails[]>{
    console.log('in Service')
    //getTempAnomaly below has to match the backend url
    return this.http.get<iStormDetails[]>(this.climateURL + `getStormDetails/${episode_id}`)
    //this.http.get<iStormDetails>(this.climateURL + `getStormDetails/${episodeID}`)
}
}