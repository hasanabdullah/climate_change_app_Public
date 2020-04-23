import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-climate-dashboard',
  templateUrl: './climate-dashboard.component.html',
  styleUrls: ['./climate-dashboard.component.css']
})
export class ClimateDashboardComponent implements OnInit {
  // Inject UserSelection service into each page and then onInit set the page's selection object to that of the userSelection singleton
  // If it works I can put the selection form on each individual page and not need to pass the user selection click event through a service.
  // (Which is what I would need to do if I had the selection form outside of the router outlet so it was permanent on each page. -- which I think is better but I don't know how to transfer the selection data through the outlet.)
  constructor() { }

  ngOnInit() {
  }

}
