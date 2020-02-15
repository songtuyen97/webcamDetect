import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import {map} from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient
  ) { }

  post(url, data): Observable<any> {
    let header = new HttpHeaders();
    // header.append
    return this.http.post(url, data).pipe(
      map((res)=> {
        console.log(res);
      },
      catchError((err, caught)=> {
        console.log(err);
        return err;
      })
    ))
  }
}
