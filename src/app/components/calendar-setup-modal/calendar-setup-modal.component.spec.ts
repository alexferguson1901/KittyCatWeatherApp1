import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CalendarSetupModalComponent } from './calendar-setup-modal.component';

describe('CalendarSetupModalComponent', () => {
  let component: CalendarSetupModalComponent;
  let fixture: ComponentFixture<CalendarSetupModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CalendarSetupModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarSetupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
