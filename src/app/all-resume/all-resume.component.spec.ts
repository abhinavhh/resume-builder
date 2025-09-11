import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllResumeComponent } from './all-resume.component';

describe('AllResumeComponent', () => {
  let component: AllResumeComponent;
  let fixture: ComponentFixture<AllResumeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllResumeComponent]
    });
    fixture = TestBed.createComponent(AllResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
