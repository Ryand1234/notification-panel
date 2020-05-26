import { Component, OnInit, HostListener } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LoginService } from './login.service';
import { RegisterService } from './register.service';
import $ from 'jquery';
import { Router } from '@angular/router';


@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {

  innerWidth: any;
  msg: any;

  @HostListener('window:resize', ['$event'])
onResize(event?) {
  this.innerWidth = window.innerWidth;
  if(this.innerWidth < 700){
      $(".login").css({"margin" : "1.5cm"})
      $(".register").css({"margin" : "1.5cm"})
  }else{
    $(".login").css({"margin-left" : "12cm"})
    $(".register").css({"margin-left" : "12cm"})
    $(".register").css({"margin-right" : "12cm"})
    $(".login").css({"margin-right" : "12cm"})
    $(".login").css({"margin-top" : "3cm"});
    $(".register").css({"margin-top" : "3cm"});
  }
}
  
  constructor(private loginService : LoginService, 
		private registerService : RegisterService,
		private router : Router) {}

  construction() {
    this.onResize();
  }
  error: any;
  info = new FormGroup({
	email : new FormControl(''),
	 passwd : new FormControl('')
	});

  user = new FormGroup({
  name : new FormControl(''),
  username : new FormControl(''),
  email : new FormControl(''),
  passwd : new FormControl(''),
  mobile : new FormControl('')
  });

  ngOnInit() {
    this.innerWidth = window.innerWidth;
    if(this.innerWidth < 700){
      $(".login").css({"margin" : "3cm"})
      $(".register").css({"margin" : "3cm"})
    }
    $(".register").hide();
    $("#register").click(function(){
      $(".login").hide();
      $(".register").show();
    })

    $("#login").click(function(){
      $(".register").hide();
      $(".login").show();
    })
  }

  onLogin(){
    var login = {
    email : this.info.value.email,
    passwd : this.info.value.passwd
    };

    this.loginService.login(login).subscribe((result: any)=>{
		this.error = '';
		this.msg = result;
		console.log("MSG: ",this.msg)
		this.router.navigate(['/home']);
	}, (err)=>{ 
    this.error = err});
  }

  onRegister(){
    var userinfo = {
    username: this.user.value.username,
    name: this.user.value.name,
    email: this.user.value.email,
    passwd: this.user.value.passwd,
    mobile: this.user.value.mobile
  };

  console.log("SER: ",userinfo);
  //var result = this.http.post('/api/user/register',data);
  this.registerService.register(userinfo).subscribe((result)=>{
  this.msg = result;
  });
  }

}
