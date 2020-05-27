import { Component, OnInit } from '@angular/core';
import { NotifyService } from './notify.service';
import $ from 'jquery'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	user: any;
	constructor( private service : NotifyService) { 
		this.service.incommingNotification().subscribe((data)=>{
			this.user = data.name;
			$(".notify").show();
		})
	}

	user_profile: any;

	ngOnInit(): void {

		this.service.getUser().subscribe((result)=>{
				
				this.user_profile = result;
				console.log("YE", this.user_profile)
		})
		$(".notify").hide();
		$(".cross").click(function(){
			$(".notify").hide();
		})
	}
}
