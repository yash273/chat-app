import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { FirebaseError } from 'firebase/app';
// import { FirebaseError } from 'firebase/auth';
import { Observable, from, of } from 'rxjs';
import { AlertService } from '../alert/alert.service';




@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  currentUser$ = authState(this.auth)

  constructor(
    private auth: Auth,
    private alert: AlertService
  ) { }

  login(username: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, username, password))
  }

  logout() {
    return from(this.auth.signOut())
  }

  signUp(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password))
  }

  showError(error: FirebaseError) {
    if (error.code === 'auth/user-not-found') {
      this.alert.showAlert("User Not Found", "error")
    } if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email') {
      this.alert.showAlert("Incorrect Credentials", "error")
    } if (error.code === 'auth/network-request-failed') {
      this.alert.showAlert("Network Error... Please check Connection", "error")
    } else {
      // Handle other errors
    }
  };
}


