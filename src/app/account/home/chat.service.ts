import { Injectable } from '@angular/core';
import { DocumentData, DocumentReference, DocumentSnapshot, Firestore, Query, Timestamp, addDoc, collection, collectionData, doc, endBefore, getDocs, getFirestore, limit, limitToLast, orderBy, query, setDoc, startAfter, updateDoc, where } from '@angular/fire/firestore';
import { TypingStatus, userProfile } from '../../interfaces/user';
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
        is_chatOpen: false,
        userIds: [user?.uid, chatUser.uid],
        users: [
          {
            displayName: user?.displayName ?? '',
            photoURL: user?.photoURL ?? '',
            uid: user?.uid ?? '',

          },
          {
            displayName: chatUser?.displayName ?? '',
            photoURL: chatUser?.photoURL ?? '',
            uid: chatUser?.uid ?? '',

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
      const { displayName, photoURL, uid } = chat.users[chatUserIndex];
      chat.chatName = displayName;
      chat.chatPic = photoURL;
      chat.chatUser = uid
    });
    return chats
  }

  createMessages(chatId: string, message: string, imgURL: string, currentUser: userProfile, selectedChat: Chat): Observable<any> {
    const ref = collection(this.fireStore, 'chats', chatId, 'messages');
    const chatRef = doc(this.fireStore, 'chats', chatId);
    const sentDate = Timestamp.fromDate(new Date());
    let status = false;
    if (selectedChat.is_chatOpen == true &&
      selectedChat.chatOpenedBy === currentUser.uid) {
      status = true;
    }
    return this.userService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) =>

        addDoc(ref, {
          text: message,
          senderId: user?.uid,
          imgURL: imgURL,
          sentDate: sentDate,
          is_seen: status
        })
      ),
      concatMap(() => updateDoc(chatRef, {
        lastMessage: message,
        lastMessageDate: sentDate,
        lastMessageUserId: currentUser.uid,
      }))
    )

  }

  lastSeenMessages(selectedChat: Chat, ChatId: string) {
    const chatRef = doc(this.fireStore, 'chats', ChatId);
    const openedDate = Timestamp.fromDate(new Date());
    return this.userService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) => updateDoc(chatRef, {
        lastMessageSeenAt: openedDate,
        lastMessageSeenByUserId: user?.uid,
      })),
    )
  }

  getPreviousChatMessages(chatId: string, lastMessage: Message | null): Observable<Message[]> {
    const ref = collection(this.fireStore, 'chats', chatId, 'messages');
    let queryAll: Query<DocumentData>
    if (lastMessage) {
      const startAfterValue = lastMessage.sentDate;
      queryAll = query(ref, orderBy('sentDate', 'asc'), limitToLast(20), endBefore(startAfterValue));
    } else {
      queryAll = query(ref, orderBy('sentDate', 'asc'), limitToLast(20));
    }
    return collectionData(queryAll) as Observable<Message[]>;
  }

  getChatMessages(chatId: string): Observable<Message[]> {
    const ref = collection(this.fireStore, 'chats', chatId, 'messages');
    const queryAll = query(ref, orderBy('sentDate', 'asc'), limitToLast(20));
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

  openChat(selectedChat: Chat, chatId: string) {
    const chatRef = doc(this.fireStore, 'chats', chatId);
    const openedDate = Timestamp.fromDate(new Date());
    return this.userService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) => updateDoc(chatRef, {
        chatOpenedAt: openedDate,
        is_chatOpen: true,
        chatOpenedBy: selectedChat.chatUser
      })),
    )
  }

  updateIsSeenMessage(chatId: string) {
    const collectionRef = collection(this.fireStore, 'chats', chatId, 'messages');
    getDocs(collectionRef).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        updateDoc(doc.ref, {
          is_seen: true
        });
      });
    });
  }

  startTyping(currentUserId: string, chatId: string) {
    const userTypingRef = doc(this.fireStore, 'chats', chatId, 'typingStatus', currentUserId);
    return this.userService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) => setDoc(userTypingRef, {
        isTyping: true,
      })),
    )
  }

  stopTyping(currentUserId: string, chatId: string) {
    const userTypingRef = doc(this.fireStore, 'chats', chatId, 'typingStatus', currentUserId);
    return this.userService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) => setDoc(userTypingRef, {
        isTyping: false
      })),
    )
  }

  // listenTypingStatus(currentUserId: string, chatId: string, callback: (isTyping: boolean) => void): void {
  //   const typingStatusDoc =  doc(this.fireStore, 'chats', chatId,'typingStatus',currentUserId);
  //   typingStatusDoc.valueChanges()
  //   .pipe(
  //     map((doc: DocumentSnapshot<TypingStatus>) => {
  //       const data = doc.data();
  //       return data?.isTyping ?? false;
  //     })
  //   ).subscribe((isTyping: boolean) => {
  //     callback(isTyping);
  //   });
  // }
}
