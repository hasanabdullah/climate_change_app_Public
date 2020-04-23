import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClimateAnomaliesComponent } from './climate-anomalies.component';

describe('ClimateAnomaliesComponent', () => {
  let component: ClimateAnomaliesComponent;
  let fixture: ComponentFixture<ClimateAnomaliesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClimateAnomaliesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClimateAnomaliesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
