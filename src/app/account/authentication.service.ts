import { Injectable } from '@angular/core';
import {
  Auth,
  UserCredential,
  UserInfo,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';



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

  updateProfileData(ProfileData: Partial<UserInfo>): Observable<any> {
    const user = this.auth.currentUser;
    return of(user).pipe(
      concatMap(user => {
        if (!user) throw new Error('Not Authenticated')
        return updateProfile(user, ProfileData)
      })
    )
  }

  signUp(email: string, password: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password))
  }
}


