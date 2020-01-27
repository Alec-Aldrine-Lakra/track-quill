import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpEvent, HttpEventType } from "@angular/common/http";
import {Observable} from "rxjs/Observable";

@Injectable({
  providedIn: 'root'
})
export class VerhistoryService {

  constructor(private http: HttpClient) {
  }

  private totalVersions;
  getVersion(id: any){
    return this.http.get(`http://localhost:8080/versions/${id}`)
  }

  uppdateVersionName(id: any, name: string) {
    return this.http.post(`http://localhost:8080/versions`,{id, name},{})
  }

  insertVersion(roomid: any) {
    return this.http.post(`http://localhost:8080/versions`,{'docid': roomid},{});
  }
}
