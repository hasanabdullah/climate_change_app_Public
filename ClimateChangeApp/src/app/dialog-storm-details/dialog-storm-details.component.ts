import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

//local import
import { ClimateDataService } from 'src/app/services/climate-data.service';
import { iStormDetails } from '../classes/storm-details';

import { StormEventsComponent } from '../storm-events/storm-events.component';


@Component({
  selector: 'app-dialog-storm-details',
  templateUrl: './dialog-storm-details.component.html',
  styleUrls: ['./dialog-storm-details.component.css']
})
export class DialogStormDetailsComponent implements OnInit {

  test: 18

  constructor(private climateDataService : ClimateDataService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }


}
