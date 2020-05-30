import { Component, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';
import $ from "jquery"

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

	user: any;
	constructor(private service : NotificationService) { 
		this.service.incommingNotification().subscribe((data)=>{
			this.user = data.name;
			$(".notify").show();
		})
	}

	notification_array: any = new Array();

	ngOnInit(): void {

		this.service.notification().subscribe((result)=>{
			this.notification_array = result;
			this.service.connect();
		});
		$(".notify").hide();
		$(".cross").click(function(){
			$(".notify").hide();
		})
	}

}
