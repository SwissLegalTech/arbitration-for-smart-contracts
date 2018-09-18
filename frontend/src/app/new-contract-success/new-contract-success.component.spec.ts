import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewContractSuccessComponent } from './new-contract-success.component';

describe('NewContractSuccessComponent', () => {
  let component: NewContractSuccessComponent;
  let fixture: ComponentFixture<NewContractSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewContractSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewContractSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
