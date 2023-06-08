import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { emailRegx, nameRegx, passRegx } from 'src/app/regex-rules/regex';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  hide = true;
  registerForm!: FormGroup

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createRegister()
  }

  createRegister(): FormGroup {
    return this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(nameRegx)]],
      email: ['', [Validators.required, Validators.pattern(emailRegx)]],
      password: ['', [Validators.required, Validators.pattern(passRegx)]]
    })
  }

  get registerform() {
    return this.registerForm.controls;
  }

  onSubmit() {
    const { email, password, name } = this.registerForm.value;
    this.authService
      .signUp(email, password).pipe(
        switchMap(({ user: { uid } }) => this.userService.addUser({ uid, email, displayName: name })
        ))
      .subscribe(() => {
        this.router.navigate(['home'])
      })
  }

}
