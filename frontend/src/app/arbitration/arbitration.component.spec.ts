import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArbitrationComponent } from './arbitration.component';

describe('ArbitrationComponent', () => {
  let component: ArbitrationComponent;
  let fixture: ComponentFixture<ArbitrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArbitrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArbitrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
