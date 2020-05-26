import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'
import io from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class LogoutService {

	private url = "/api/user/logout";
	private socket = io('http://localhost:3000')
	constructor(private http : HttpClient) { }

        httpOptions = new HttpHeaders({'Content-Type':'application/json'}); 
	logout() {
		return this.http.post(this.url, { headers: this.httpOptions, responseType: 'json'});
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
