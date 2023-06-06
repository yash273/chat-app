import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { User } from 'firebase/auth';
import { UserService } from '../user.service';
import { concatMap } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user$ = this.authService.currentUser$;

  profileForm = this.formBuilder.group({
    uid: [''],
    displayName: [''],
    firstName: [''],
    lastName: [''],
    phone: [''],
  });

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
  }

  uploadImage(event: any, user: User) {
    this.userService.uploadImage(event.target.files[0], `images/profile/${user.uid}`)
      .pipe(
        concatMap((photoURL) => this.authService.updateProfileData({ photoURL }))
      ).subscribe();
  }

  saveProfile() {

  }

}
