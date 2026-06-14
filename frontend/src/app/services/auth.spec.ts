import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    });
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
