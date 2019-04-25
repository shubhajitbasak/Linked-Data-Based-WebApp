import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DbpediaService {

  constructor(
    private apiService: ApiService
  ) { }

  getData(query: string): Observable<any> {
    // const httpParams:HttpParams = {
    // }
    // http://dbpedia.org/sparql?query=SELECT+DISTINCT+?concept+WHERE+{+?s+a+?concept+}+LIMIT+50
    return this.apiService.get(environment.dbpedia_url+'?query='+encodeURIComponent(query)+'&format=json');
  }

}
