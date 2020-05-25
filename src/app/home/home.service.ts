import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

	constructor(private http : HttpClient) { }
	private socket = io('http://localhost:3000')
	private url = '/api/users';

	getUsers(){
		return this.http.get(this.url);
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
