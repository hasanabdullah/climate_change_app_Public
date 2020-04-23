import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { UserSelection } from '../classes/user-selection';
//import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
/**
 * The user selection service uses a subject-subscriber relationship so that it can push the user selection data (state, 
 * start date, end date) to all its subscribers whenever the user enters a new selection. The selection-form is the pusher, 
 * and all the charts are the receivers. This way all the charts just get the new user selection immediately, rather than
 * needing to ask for it.
 */
export class UserSelectionService {

  //userSelectionSource = new Subject<UserSelection>();
  userSelectionSource = new BehaviorSubject<UserSelection>({state: 'MN', startDate: '2009-01-01', endDate: '2009-02-01'});
  userSelection$ = this.userSelectionSource.asObservable();

  constructor(/*private http: HttpClient*/) { 
    /* My brief attempt at geolocating the user on app load so we can display info in their state. 
    The user needs to OKAY the app to use location services when the page loads. 
    Then I try to use a webservice called geonames to reverse geolocate the state from the navigator's lat and lon.
    Obviously this doesn't work yet, but I think most of the pieces are here.

    --Update: The Fetch works! Now need to get the lat and lon before the fetch in order to pass it in, then extract fetch data to the class.
    --Update: Now fetching location based on user location, so just need to extract that data to the class now!
     */

    navigator.geolocation.getCurrentPosition((pos) => {
      var crd = pos.coords;

      console.log('Your current position is:');
      console.log(`Latitude : ${crd.latitude}`);
      console.log(`Longitude: ${crd.longitude}`);
      console.log(`More or less ${crd.accuracy} meters.`);
    
      //this.lat = crd.latitude;
      //this.lon = crd.longitude;
      var st = '';
      var x = fetch(`http://api.geonames.org/findNearestAddressJSON?lat=${crd.latitude}&lng=${crd.longitude}&username=iaimtomisbehave3`)
      .then(res => {
        console.log('geocode raw res: ', res)
        res.json().then(data => {
          console.log('geocode api: ', data)
          console.log('geocode api1: ', data.address.adminName1)
          //this.userSelectionSource = new BehaviorSubject<UserSelection>({state: data.address.adminName1, startDate: '2009-01-01', endDate: '2009-01-05'});
          //console.log("US Source: ", this.userSelectionSource)
          st = data.address.adminName1
          console.log('here', st)
        //this.userSelectionSource = new BehaviorSubject<UserSelection>({state: st, startDate: '2009-01-01', endDate: '2009-01-05'});
        this.userSelectionSource.next({state: data.address.adminCode1, startDate: '2000-01-01', endDate: '2001-01-01'})
        console.log('US new: ', this.userSelectionSource.value)
        })
        //console.log('geocode json: ' , res.json())
      });
      
    });
    //var x = http.get('http://api.geonames.org/findNearestAddressJSON?lat=37.451&lng=-122.18&username=demo')
    //console.log('geocode: ', x);

    // fetch('http://api.geonames.org/findNearestAddressJSON?lat=37.451&lng=-122.18&username=iaimtomisbehave3')
    // .then(res => {
    //   console.log('geocode raw res: ', res)
    //   res.json().then(data => {
    //     console.log('geocode api: ', data)
    //   })
    //   //console.log('geocode json: ' , res.json())
    // });
  }

  // Success is called when the navigator gets the user's current position (in the constructor)
  // success(pos){
  //   var crd = pos.coords;

  //   console.log('Your current position is:');
  //   console.log(`Latitude : ${crd.latitude}`);
  //   console.log(`Longitude: ${crd.longitude}`);
  //   console.log(`More or less ${crd.accuracy} meters.`);
  
  //   //this.lat = crd.latitude;
  //   //this.lon = crd.longitude;
  //   var st = '';
  //   fetch(`http://api.geonames.org/findNearestAddressJSON?lat=${crd.latitude}&lng=${crd.longitude}&username=iaimtomisbehave3`)
  //   .then(res => {
  //     console.log('geocode raw res: ', res)
  //     res.json().then(data => {
  //       console.log('geocode api: ', data)
  //       console.log('geocode api1: ', data.address.adminName1)
  //       //this.userSelectionSource = new BehaviorSubject<UserSelection>({state: data.address.adminName1, startDate: '2009-01-01', endDate: '2009-01-05'});
  //       //console.log("US Source: ", this.userSelectionSource)
  //       st = data.address.adminName1
  //     })
  //     //console.log('geocode json: ' , res.json())
  //   });
  //   this.userSelectionSource = new BehaviorSubject<UserSelection>({state: st, startDate: '2009-01-01', endDate: '2009-01-05'});

  // }

  /** Push the new user selection data to all the subscribers (charts) */
  sendUserSelection(selection : UserSelection) {
    this.userSelectionSource.next(selection);
  }

}
