import { Injectable } from '@angular/core';
import { Firestore, collectionData, doc, docData, setDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { userProfile } from '../interfaces/user';
import { AuthenticationService } from './authentication.service';
import { collection, query } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  get currentUserProfile$(): Observable<userProfile | null> {
    return this.authService.currentUser$.pipe(
      switchMap(user => {

        if (!user?.uid) {
          return of(null);
        }

        const ref = doc(this.fireStore, 'users', user?.uid)
        return docData(ref) as Observable<userProfile>
      })
    )
  }

  constructor(
    private storage: Storage,
    private fireStore: Firestore,
    private authService: AuthenticationService
  ) { }

  uploadImagex(image: File, path: string): Observable<string> {
    const storageRef = ref(this.storage, path);
    const uploadWork = from(uploadBytes(storageRef, image));
    return uploadWork.pipe(
      switchMap((res) => getDownloadURL(res.ref))
    );
  }

  addUser(user: userProfile): Observable<any> {
    const ref = doc(this.fireStore, 'users', user?.uid)
    return from(setDoc(ref, user))
  }

  updateUser(user: userProfile): Observable<any> {
    const ref = doc(this.fireStore, 'users', user?.uid)
    return from(updateDoc(ref, { ...user }))
  }

  get allUsers$(): Observable<userProfile[]> {
    const ref = collection(this.fireStore, 'users');
    const queryAll = query(ref);
    return collectionData(queryAll) as Observable<userProfile[]>
  }

}
