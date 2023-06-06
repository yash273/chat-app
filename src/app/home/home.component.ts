import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../account/authentication.service';
import { UserService } from '../account/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user$ = this.userService.currentUserProfile$

  constructor(
    private userService: UserService
  ) { }

  ngOnInit(): void {
  }

}
