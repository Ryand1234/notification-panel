import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

	private url = '/api/user/login';
	private check_url = '/api/islogin';
  constructor(private http : HttpClient) { }

	login(data:any) {
		console.log("data: ",data);
		return this.http.post(this.url, data);
	}

	httpOptions = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
	isLogin(){ 
		return this.http.post(this.check_url, { headers: this.httpOptions, responseType: 'json'})
	}
}
