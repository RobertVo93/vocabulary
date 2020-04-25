import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertToKanjiComponent } from './convert-to-kanji.component';

describe('ConvertToKanjiComponent', () => {
  let component: ConvertToKanjiComponent;
  let fixture: ComponentFixture<ConvertToKanjiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConvertToKanjiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertToKanjiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
