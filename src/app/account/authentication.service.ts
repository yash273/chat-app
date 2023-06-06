import { Injectable } from '@angular/core';
import {
  Auth,
  UserCredential,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  currentUser$ = authState(this.auth)

  constructor(
    private auth: Auth
  ) { }

  login(username: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, username, password))
  }

  logout() {
    return from(this.auth.signOut())
  }

  signUp(email: string, password: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password))
  }
}


