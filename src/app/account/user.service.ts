import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private storage: Storage
  ) { }

  uploadImage(image: File, path: string): Observable<string> {
    const storageRef = ref(this.storage, path);
    const uploadWork = from(uploadBytes(storageRef, image));
    return uploadWork.pipe(
      switchMap((res) => getDownloadURL(res.ref))
    );
  }
}
