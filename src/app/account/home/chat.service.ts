import { Injectable } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection, collectionData, doc, getFirestore, orderBy, query, updateDoc, where } from '@angular/fire/firestore';
import { userProfile } from '../../interfaces/user';
import { Observable, from } from 'rxjs';
import { UserService } from '../user.service';
import { concatMap, finalize, map, switchMap, take, tap } from 'rxjs/operators';
import { Chat, Message } from '../../interfaces/chat';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private fireStore: Firestore,
    private userService: UserService,
    private storage: Storage,
  ) {

  }

  createChat(chatUser: userProfile): Observable<string> {
    const ref = collection(this.fireStore, 'chats');
    return this.userService.currentUserProfile$.pipe(
      take(1),
      concatMap(user => addDoc(ref, {
        userIds: [user?.uid, chatUser.uid],
        users: [
          {
            displayName: user?.displayName ?? '',
            photoURL: user?.photoURL ?? ''
          },
          {
            displayName: chatUser?.displayName ?? '',
            photoURL: chatUser?.photoURL ?? ''
          }
        ]
      })),
      map(ref => ref.id)
    )
  }

  get myChat$(): Observable<Chat[]> {
    const ref = collection(this.fireStore, 'chats');
    return this.userService.currentUserProfile$.pipe(
      concatMap((user) => {
        const myQuery = query(ref, where('userIds', 'array-contains', user?.uid));
        return collectionData(myQuery, { idField: 'id' }).pipe(
          map((chats: any) => this.addChatNameAndPic(user?.uid, chats))
        ) as Observable<Chat[]>;
      })
    )
  }

  addChatNameAndPic(currentUserId: string | undefined, chats: Chat[]): Chat[] {
    chats.forEach((chat: Chat) => {
      const chatUserIndex = chat.userIds.indexOf(currentUserId ?? '') === 0 ? 1 : 0;
      const { displayName, photoURL } = chat.users[chatUserIndex];
      chat.chatName = displayName;
      chat.chatPic = photoURL;
    });
    return chats
  }

  createMessages(chatId: string, message: string, imgURL: string, lastMessageUserId: string): Observable<any> {
    const ref = collection(this.fireStore, 'chats', chatId, 'messages');
    const chatRef = doc(this.fireStore, 'chats', chatId);
    const sentDate = Timestamp.fromDate(new Date());
    // if(lastMessageUserId == )
    const messageStatus = 'unseen'
    return this.userService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) => addDoc(ref, {
        text: message,
        senderId: user?.uid,
        imgURL: imgURL,
        sentDate: sentDate,
        status: messageStatus
      })),
      concatMap(() => updateDoc(chatRef, {
        lastMessage: message,
        lastMessageDate: sentDate,
        lastMessageUserId: lastMessageUserId,
      }))
    )
  }

  lastmessageSeen(chatId: string) {
    debugger
    const chatRef = doc(this.fireStore, 'chats', chatId);
    const today = Timestamp.fromDate(new Date());
    return this.userService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) => updateDoc(chatRef, {
        lastMessageDate: today,
        lastMessageUserId: user?.uid
      }))
    )
  }

  getChatMessages(chatId: string): Observable<Message[]> {
    const ref = collection(this.fireStore, 'chats', chatId, 'messages');
    const queryAll = query(ref, orderBy('sentDate', 'asc'));
    return collectionData(queryAll) as Observable<Message[]>
  }

  isThereChat(chatUserId: string): Observable<string | null> {
    return this.myChat$.pipe(
      take(1),
      map(chats => {
        for (let i = 0; i < chats.length; i++) {
          if (chats[i].userIds.includes(chatUserId)) {
            return chats[i].id
          }
        }
        return null
      })
    )
  }

  chatClose() {
    if (window.screen.width <= 991) {
      const chatListClass = document.getElementsByClassName('chat-container')
      chatListClass[0].classList.toggle('chatClose')
    }
  }

  uploadImageToStorage(imageFile: File, selectedChatId: string): Observable<any> {
    const imageName = Date.now() + "_" + imageFile.name;
    const filePath = `chatImages/${selectedChatId}/${imageName}`;
    const storageRef = ref(this.storage, filePath);
    const uploadTask = from(uploadBytes(storageRef, imageFile));
    return uploadTask.pipe(
      switchMap((res) => getDownloadURL(res.ref))
    )
  }

  getImageURL(imageFile: File, selectedChatId: string) {
    return this.uploadImageToStorage(imageFile, selectedChatId)
  }

}
