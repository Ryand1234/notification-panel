import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import $ from 'jquery'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	user: any;
	constructor( private service : HomeService ) { 
		this.service.incommingNotification().subscribe((data)=>{
			this.user = data.name;
			$(".notify").show();
		})
	}

	user_array : any = new Array()

	ngOnInit(): void {

		this.service.getUsers().subscribe((result)=>{
				
				this.user_array = result;
				this.service.connect();
				console.log("YE", this.user_array)
		})
		$(".notify").hide();
		$(".cross").click(function(){
			$(".notify").hide();
		})
	}

}
