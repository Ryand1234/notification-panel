import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

	constructor(private http : HttpClient) { }
        private socket = io('https://notification-panel.herokuapp.com/')
        private url = '/api/profile';

        httpOptions = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
        getUser(){
                return this.http.post(this.url, { headers: this.httpOptions, responseType: 'json'});
        }

        incommingNotification(){
                var notify = new Observable<any>(
                        observer => {
                        this.socket.on('noti', (data)=>{
                                observer.next(data);
                        });
                });

                return notify;
        }

}
