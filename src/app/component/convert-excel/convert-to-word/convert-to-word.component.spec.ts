import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertToWordComponent } from './convert-to-word.component';

describe('ConvertToWordComponent', () => {
  let component: ConvertToWordComponent;
  let fixture: ComponentFixture<ConvertToWordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConvertToWordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertToWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
