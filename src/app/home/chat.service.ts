import { Injectable } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection, collectionData, doc, orderBy, query, updateDoc, where } from '@angular/fire/firestore';
import { userProfile } from '../interfaces/user';
import { Observable } from 'rxjs';
import { UserService } from '../account/user.service';
import { concatMap, map, take, tap } from 'rxjs/operators';
import { Chat, Message } from '../interfaces/chat';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private fireStore: Firestore,
    private userService: UserService
  ) { }

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

  createMessages$(chatId: string, message: string): Observable<any> {
    const ref = collection(this.fireStore, 'chats', chatId, 'messages');
    const chatRef = doc(this.fireStore, 'chats', chatId);
    const sentDate = Timestamp.fromDate(new Date())
    // debugger
    return this.userService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) => addDoc(ref, {
        text: message,
        senderId: user?.uid,
        sentDate: sentDate
      })),
      concatMap(() => updateDoc(chatRef, {
        lastMessage: message,
        lastMessageDate: sentDate
      }))
    )
  }

  getChatMessages$(chatId: string): Observable<Message[]> {
    const ref = collection(this.fireStore, 'chats', chatId, 'messages');
    const queryAll = query(ref, orderBy('sentDate', 'asc'));
    // debugger
    return collectionData(queryAll) as Observable<Message[]>
  }
}
