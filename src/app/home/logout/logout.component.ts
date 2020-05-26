import { Component, OnInit } from '@angular/core';
import { LogoutService } from './logout.service';
import $ from 'jquery'
import { Router } from '@angular/router'

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

	user: any;
	constructor(private service : LogoutService,
				private router : Router) {
		this.service.incommingNotification().subscribe((data)=>{
			this.user = data.name;
			$(".notify").show();
		})	
	}

	ngOnInit() {
		$(".notify").hide();
		$(".cross").click(function(){
			$(".notify").hide();
		})
	}

	msg: any;
	onSubmit() {
		this.service.logout().subscribe((result: any)=>{
		this.msg = result;
		this.router.navigate(['/auth'])
		}, (err)=>{this.msg = err});
	}
}
