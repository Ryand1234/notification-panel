import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { ProfileComponent } from './home/profile/profile.component';
import { LogoutComponent } from './home/logout/logout.component';
import { NotificationComponent } from './home/notification/notification.component';

const routes: Routes = [
{ path: '', redirectTo: "/auth", pathMatch: "full"},
{ path: 'home', component: HomeComponent },
{ path: 'logout', component: LogoutComponent },
{ path: 'auth', component: AuthenticationComponent },
{ path: 'profile', component: ProfileComponent },
{ path: 'notification', component: NotificationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
