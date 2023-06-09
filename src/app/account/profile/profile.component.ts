import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { concatMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { userProfile } from 'src/app/interfaces/user';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/alert/alert.service';


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
  loading!: boolean;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private alert: AlertService
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
    this.loading = true;
    if (this.loading = true) {
      this.alert.showAlert("Loading... Please wait", "default")
    }
    this.userService.uploadImage(event.target.files[0], `images/profile/${user.uid}`)
      .pipe(
        concatMap((photoURL) => this.userService.updateUser({ uid: user?.uid, photoURL }))
      ).subscribe(() => {
        this.alert.showAlert("Image Updated", "success"),
          this.loading = false
      },
        (error) => {
          this.alert.showAlert(error, "error"),
            this.loading = false
        });
  }

  saveProfile() {
    this.loading = true;
    if (this.loading = true) {
      this.alert.showAlert("Loading... Please wait", "default")
    }
    if (this.profileForm.valid) {
      const profileData = this.profileForm.value;
      this.userService.updateUser(profileData)
        .subscribe(() => {
          this.router.navigate(['home']),
            this.alert.showAlert("Profile Updated", "success"),
            this.loading = false
        },
          (error) => {
            this.alert.showAlert(error, "error"),
              this.loading = false
          },
        )
    } else {
      return this.alert.showAlert("Please Fill Valid Data", "error")

    }
  }

}
