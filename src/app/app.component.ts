import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AuthenticationService } from './account/authentication.service';
import { Router } from '@angular/router';
import { UserService } from './account/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  user$ = this.userService.currentUserProfile$

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private router: Router
  ) { }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate([''])
    })
  }

}
