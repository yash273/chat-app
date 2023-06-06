import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AuthenticationService } from './account/authentication.service';
import { Router } from '@angular/router';
import { NgIfContext } from '@angular/common';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('loginButton') loginButton!: TemplateRef<NgIfContext<User | null>>;

  constructor(
    public authService: AuthenticationService,
    private router: Router
  ) { }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate([''])
    })
  }
}
