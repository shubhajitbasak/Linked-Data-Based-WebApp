import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryRunnerComponent } from './query-runner.component';

describe('QueryRunnerComponent', () => {
  let component: QueryRunnerComponent;
  let fixture: ComponentFixture<QueryRunnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryRunnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryRunnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
