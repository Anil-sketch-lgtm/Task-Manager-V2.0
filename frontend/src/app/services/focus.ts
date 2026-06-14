import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FocusService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/focus`;

  logSession(session: { startTime: string, endTime: string, interruptions: number }): Observable<any> {
    return this.http.post(this.apiUrl, session);
  }
}
