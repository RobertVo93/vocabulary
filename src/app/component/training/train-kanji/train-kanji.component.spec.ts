import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainKanjiComponent } from './train-kanji.component';

describe('KanjiComponent', () => {
  let component: TrainKanjiComponent;
  let fixture: ComponentFixture<TrainKanjiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainKanjiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainKanjiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
