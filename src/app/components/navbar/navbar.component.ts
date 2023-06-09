import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/account/authentication.service';
import { ChatService } from 'src/app/account/home/chat.service';
import { UserService } from 'src/app/account/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  user$ = this.userService.currentUserProfile$

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private chatService: ChatService,
    private router: Router
  ) { }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate([''])
    })
  }

  chatClose() {
    this.chatService.chatClose()
  }

}
