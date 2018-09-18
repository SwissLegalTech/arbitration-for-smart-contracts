import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';

const url = 'http://127.0.0.1:3030/';

export interface UploadResult {
  response: Promise<HttpResponse<any>>;
  progress$: Observable<number>;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private http: HttpClient) {
  }

  public upload(file: File, uri: string, paramName: string, additionalFormData: Map<string, string>): UploadResult {
    // create a new multipart-form for every file
    const formData: FormData = new FormData();
    formData.append(paramName, file, file.name);

    additionalFormData.forEach((val: string, key: string) => {
      formData.append(key, val);
    });

    // create a http-post request and pass the form
    // tell it to report the upload progress
    const req = new HttpRequest('POST', url + uri, formData, {
      reportProgress: true
    });

    // create a new progress-subject for every file
    const progress = new Subject<number>();
    const response = new Promise<HttpResponse<any>>((resolve, reject) => {
      // send the http-request and subscribe for progress-updates
      this.http.request(req).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {

          // calculate the progress percentage
          const percentDone = Math.round(100 * event.loaded / event.total);

          // pass the percentage into the progress-stream
          progress.next(percentDone);
        } else if (event instanceof HttpResponse) {
          // Close the progress-stream if we get an answer form the API
          // The upload is complete
          progress.complete();

          resolve(event);
        }
      });
    });

    // return the map of progress.observables
    return {
      'response': response,
      'progress$': progress.asObservable()
    };
  }
}
