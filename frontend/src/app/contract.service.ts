import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SafeResourceUrl} from '@angular/platform-browser';

export interface ContractDetails {
  id: string;
  files: [{
    class: string,
    type: string,
    fileName: string,
    data: string|SafeResourceUrl,
    hash: string
  }];
  contacts: [{
    contact: string,
    email: string
  }];
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  constructor(private http: HttpClient) { }

  public search(contractId: string): Observable<ContractDetails> {
    const url = 'http://127.0.0.1:3030/contract/' + contractId;
    return this.http.get<ContractDetails>(url);
  }
}
