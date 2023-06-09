import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { emailRegx, passRegx } from 'src/app/regex-rules/regex';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { error } from 'console';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  hide = true;
  loginForm!: FormGroup
  loading!: boolean;


  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.createLogin()
  }

  createLogin(): FormGroup {
    return this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(emailRegx)]],
      password: ['', [Validators.required, Validators.pattern(passRegx)]]
    })
  }

  get loginform() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (!this.loginForm.valid) {
      return this.alert.showAlert("Please Fill Valid Data", "error")
    }
    this.loading = true;
    if (this.loading = true) {
      this.alert.showAlert("Loading... Please wait", "default")
    }
    const { email, password } = this.loginForm.value;
    this.authService
      .login(email, password).subscribe(
        () => {
          this.router.navigate(['home']),
            this.alert.showAlert("Login Successfull", "success"),
            this.loading = false
        },
        (error) => {
          this.authService.showError(error)
          this.loading = false
        },

      )
  }

}
