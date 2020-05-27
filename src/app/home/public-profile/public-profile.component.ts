import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import $ from 'jquery';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})
export class PublicProfileComponent implements OnInit {

	user: any;
	constructor( private service : ProfileService,
				private router : Router ) { 
		this.service.incommingNotification().subscribe((data)=>{
			this.user = data.name;
			$(".notify").show();
		})
	}

	user_profile: any;
	token: any;

	ngOnInit(): void {

		this.token = this.router.url.split('/')[2]
		console.log("TOKEN: ",this.token);

		this.service.getUser(this.token).subscribe((result)=>{
				
				this.user_profile = result;
				console.log("YE", this.user_profile)
		})

		var data = {
			_id : this.token
		}

		this.service.notifyUser(data);

		$(".notify").hide();
		$(".cross").click(function(){
			$(".notify").hide();
		})
	}
}
