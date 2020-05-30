import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

	constructor(private http : HttpClient) { }
        private socket = io('https://notification-panel.herokuapp.com/')
        private url = '/api/notification';

        httpOptions = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
        notification(){
                return this.http.post(this.url, { headers: this.httpOptions, responseType: 'json'});
        }

        connect(){
                this.socket.emit('con');
        }

        incommingNotification(){
                var notify = new Observable<any>(
                        observer => {
                        this.socket.on('notify', (data)=>{
                                observer.next(data);
                        });
                });

                return notify;
        }

}
