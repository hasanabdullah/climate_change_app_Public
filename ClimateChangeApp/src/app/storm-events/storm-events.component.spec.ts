import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StormEventsComponent } from './storm-events.component';

describe('StormEventsComponent', () => {
  let component: StormEventsComponent;
  let fixture: ComponentFixture<StormEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StormEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StormEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
