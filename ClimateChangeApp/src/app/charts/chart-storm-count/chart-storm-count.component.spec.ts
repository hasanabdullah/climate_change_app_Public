import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartStormCountComponent } from './chart-storm-count.component';

describe('ChartStormCountComponent', () => {
  let component: ChartStormCountComponent;
  let fixture: ComponentFixture<ChartStormCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartStormCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartStormCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
