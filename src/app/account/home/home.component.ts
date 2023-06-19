import { AfterViewInit, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UserService } from '../user.service';
import { FormControl } from '@angular/forms';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { map, scan, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { userProfile } from '../../interfaces/user';
import { ChatService } from './chat.service';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { Chat, Message } from 'src/app/interfaces/chat';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  searchControl = new FormControl('');
  chatListControl = new FormControl('');
  messageControl = new FormControl('');
  emojiClicked: boolean = false;
  selectedImage!: File;
  currentUser!: userProfile | null;
  selectedChat!: any;
  isTyping = false;
  messages$: Observable<Message[]>;
  lastLoadedMessage: Message | null = null;
  allMessages: Message[] = []
  isLastMessage: boolean = false
  isNewMessage: boolean = true
  loading = true; // Track the loading state

  @ViewChild('endOfChat') endOfChat!: ElementRef;

  user$ = this.userService.currentUserProfile$;
  myChat$ = this.chatService.myChat$;

  users$ = combineLatest([
    this.userService.allUsers$,
    this.user$,
    this.searchControl.valueChanges.pipe(startWith(''))]).pipe(
      map(([users, user, searchString]) => users.filter(u => u.displayName?.toLowerCase().includes(searchString?.toLowerCase()) && u.uid !== user?.uid))
    );

  selectedChat$ = combineLatest([
    this.chatListControl.valueChanges,
    this.myChat$,
  ]).pipe(
    map(([value, chat]) =>
      chat.find((c) => c.id === value[0])
    ))
    .subscribe(
      (res) => {
        this.selectedChat = res
      }
    );

  constructor(
    private userService: UserService,
    private chatService: ChatService,
  ) {

    this.messages$ = this.chatListControl.valueChanges.pipe(
      map(value => value[0]),
      switchMap(chatId => {
        // debugger
        return this.chatService.getChatMessages(chatId).pipe(
          map((messages) => {
            this.allMessages = messages
            return this.allMessages
          }))
      }),
      tap(res => {
        if (this.isNewMessage) {
          if (this.isLastMessage) {
            this.allMessages = this.allMessages.concat(res[res.length - 1])
          } else {
            this.allMessages = res
          }
        }
        this.scrollingToBottom();
        this.isLastMessage = true
        this.isNewMessage = false;
        this.loading = false
        console.log('message$')
      }),
    );

  }

  ngOnInit(): void {
    this.userService.currentUserProfile$.subscribe((res) => { this.currentUser = res });
  }

  loadMoreMessages() {
    if (!this.loading) {
      this.loading = true;
      const lastMessage = this.allMessages[0];
      const previousMessages = this.allMessages;
      this.chatService.getPreviousChatMessages(this.chatListControl.value[0], lastMessage).subscribe(
        res => {
          this.allMessages = res.concat(previousMessages)
          this.loading = false
        }
      )
    }
  }

  createChat(chatUser: userProfile) {
    this.chatService.isThereChat(chatUser.uid).pipe(
      switchMap(chatId => {
        if (chatId) {
          return of(chatId);
        } else {
          return this.chatService.createChat(chatUser)
        }
      })
    ).subscribe(chatId => {
      this.chatListControl.setValue([chatId])
    })
  }

  sendMessage(selectedChat: Chat) {
    // debugger
    const message = this.messageControl.value;
    const selectedChatId = this.chatListControl.value[0];
    const imgURL = '';
    this.isNewMessage = true

    if (this.currentUser !== null) {
      if (message && selectedChatId || imgURL && selectedChatId) {
        this.chatService.createMessages(selectedChatId, message, imgURL, this.currentUser, selectedChat).subscribe(() => {
          this.scrollingToBottom();
        })
        this.messageControl.setValue('');
      }
    }
  }

  scrollingToBottom() {
    setTimeout(() => {
      if (this.endOfChat) {
        this.endOfChat.nativeElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 500)
  }

  chatClose() {
    this.chatService.chatClose()
  }

  handleSelection(event: { char: any; }) {
    this.messageControl.setValue(this.messageControl.value + event.char);
  }

  onImageSelected(event: any, selectedChat: Chat): any {
    const selectedImage = event.target.files[0];
    const selectedChatId = this.chatListControl.value[0];
    this.isNewMessage = true
    this.chatService.getImageURL(selectedImage, selectedChatId).subscribe(
      imageUrl => {
        const message = '';
        if (this.currentUser !== null) {
          if (message && selectedChatId || imageUrl && selectedChatId) {
            this.chatService.createMessages(selectedChatId, message, imageUrl, this.currentUser, selectedChat).subscribe(() => {
              this.scrollingToBottom();
            });
            this.messageControl.setValue('');
          }
        }
      },
      error => {
        console.error(error);
      }

    );
  }

  lastSeenMessages(selectedChat: Chat, chatId: string) {
    this.chatService.lastSeenMessages(selectedChat, chatId).subscribe();
    this.chatClose();
  }

  isMessagesRead(selectedChat: Chat, chatId: string) {
    this.chatService.openChat(selectedChat, chatId).subscribe();
    if (selectedChat.is_chatOpen == true && selectedChat.chatOpenedBy === this.currentUser?.uid) {
      this.chatService.updateIsSeenMessage(chatId)
    }
  }

  startTyping(selectedChat: Chat) {
    if (this.currentUser !== null) {

      this.chatService.startTyping(this.currentUser.uid, selectedChat.id).subscribe()
    }
  }

  stopTyping(selectedChat: Chat) {
    if (this.currentUser !== null) {

      this.chatService.stopTyping(this.currentUser.uid, selectedChat.id).subscribe()
    }
  }

  onScroll(event: any): void {
    const scrollTop = event.target.scrollTop;
    if (scrollTop == 0) {
      this.loadMoreMessages();
    }
  }
}
