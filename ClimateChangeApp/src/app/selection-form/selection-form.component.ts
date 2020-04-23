import { Component, OnInit } from '@angular/core';
import { UserSelection } from '../classes/user-selection';
import { UserSelectionService } from '../services/user-selection.service';
import { STATE_LIST } from '../classes/state-list'

@Component({
  selector: 'selection-form',
  templateUrl: './selection-form.component.html',
  styleUrls: ['./selection-form.component.css']
})
export class SelectionFormComponent implements OnInit {
  panelOpenState = true;
  states = STATE_LIST;
  userSelection = new UserSelection('', null, null)
  
  constructor(private userSelectionService: UserSelectionService) { }

  ngOnInit() {
  }

  /** Takes the new user selection data and pushes it to all the places that need it. (Which are all the Charts)  */
  onSubmit(){
    if(this.dateRangeValidation()){
      console.log(this.userSelection);
      this.userSelectionService.sendUserSelection(this.userSelection)
    } else {
      alert("The start date must be before the end date.")
    }
    
  }

  /** Takes the user inputted dates and ensures that the start date is before the end date. */
  dateRangeValidation(){
    return this.userSelection.startDate < this.userSelection.endDate
  }
}

