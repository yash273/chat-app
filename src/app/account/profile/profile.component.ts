import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { concatMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { userProfile } from 'src/app/interfaces/user';
import { Router } from '@angular/router';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user$ = this.userService.currentUserProfile$;

  profileForm = this.formBuilder.group({
    uid: [''],
    displayName: ['', [Validators.required]],
    firstName: [''],
    lastName: [''],
    phone: [''],
  });

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userService.currentUserProfile$.subscribe((user) => {
      this.profileForm.patchValue({ ...user })
    })
  }

  get profileform() {
    return this.profileForm.controls;
  }

  uploadImage(event: any, user: userProfile) {
    this.userService.uploadImage(event.target.files[0], `images/profile/${user.uid}`)
      .pipe(
        concatMap((photoURL) => this.userService.updateUser({ uid: user?.uid, photoURL }))
      ).subscribe();
  }

  saveProfile() {
    if (this.profileForm.valid) {
      const profileData = this.profileForm.value;
      this.userService.updateUser(profileData)
        .subscribe(() => {
          this.router.navigate(['home'])
        }
        )
    } else {
      return
    }
  }

}
