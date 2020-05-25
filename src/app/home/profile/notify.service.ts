import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

	constructor(private http : HttpClient) { }
        private socket = io('http://localhost:3000')
        private url = '/api/user/';

        getUser(token: any){
        		var new_url = this.url + token;
                return this.http.get(new_url);
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
