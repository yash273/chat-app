import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { emailRegx, nameRegx, passRegx } from 'src/app/regex-rules/regex';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { switchMap } from 'rxjs/operators';

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value
    const confirmPassword = control.get('confirmPassword')?.value

    if (password && confirmPassword && password !== confirmPassword) {
      return {
        passwordsDontMatch: true
      }
    }
    return null;
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  hide = true;
  hideConf = true;
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
      password: ['', [Validators.required, Validators.pattern(passRegx)]],
      confirmPassword: ['', [Validators.required]],
    },
      { Validators: passwordMatchValidator() }
    )
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
