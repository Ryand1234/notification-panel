import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http : HttpClient) { }
        private socket = io('https://notification-panel.herokuapp.com/')
        private url = '/api/profile/';

        httpOptions = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
        getUser(token: any){
        		var new_url = this.url + token
                return this.http.post(new_url, { headers: this.httpOptions, responseType: 'json'});
        }
	
	connect(){
                this.socket.emit('con');
        }
        
        notifyUser(data: any){
                this.socket.emit('check', data);
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
