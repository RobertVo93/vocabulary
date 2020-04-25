import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KanjiManagementComponent } from './kanji-management.component';

describe('KanjiManagementComponent', () => {
  let component: KanjiManagementComponent;
  let fixture: ComponentFixture<KanjiManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KanjiManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanjiManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
