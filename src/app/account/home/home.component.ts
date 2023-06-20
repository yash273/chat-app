import { AfterViewInit, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UserService } from '../user.service';
import { FormControl } from '@angular/forms';
import { Observable, Subject, combineLatest, of, timer } from 'rxjs';
import { delay, map, scan, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { userProfile } from '../../interfaces/user';
import { ChatService } from './chat.service';
import { Chat, Message } from 'src/app/interfaces/chat';
import { saveAs } from 'file-saver';



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
  selectedFile!: File;
  currentUser!: userProfile | null;
  selectedChat!: any;
  isTyping: boolean = false;
  messages$: Observable<Message[]>;
  lastLoadedMessage: Message | null = null;
  allMessages: Message[] = []
  isLastMessage: boolean = false
  isNewMessage: boolean = true
  loading: boolean = true; // Track the loading state

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
        this.loading = false;
      })
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

      timer(500)
        .pipe(
          delay(500),
          switchMap(() => this.chatService.getPreviousChatMessages(this.chatListControl.value[0], lastMessage))
        )
        .subscribe(
          res => {
            this.allMessages = res.concat(previousMessages);
            this.loading = false;
          }
        );
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
    const message = this.messageControl.value;
    const selectedChatId = this.chatListControl.value[0];
    const fileURL = '';
    this.isNewMessage = true

    if (this.currentUser !== null) {
      if (message && selectedChatId || fileURL && selectedChatId) {
        this.chatService.createMessages(selectedChatId, message, fileURL, this.currentUser, selectedChat, this.selectedFile).subscribe(() => {
          this.scrollingToBottom();
        },
          error => {
            console.log(error);
          }
        )
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

  onFileUpload(event: any, selectedChat: Chat): any {
    const selectedFile = event.target.files[0];
    const docType = selectedFile.type
    const selectedChatId = this.chatListControl.value[0];
    this.isNewMessage = true
    this.chatService.getFileURL(selectedFile, selectedChatId).subscribe(
      fileURL => {
        const message = '';
        if (this.currentUser !== null) {
          if (message && selectedChatId || fileURL && selectedChatId) {
            this.chatService.createMessages(selectedChatId, message, fileURL, this.currentUser, selectedChat, selectedFile).subscribe(() => {
              this.scrollingToBottom();
            });
            this.messageControl.setValue('');
          }
        }
      },
      error => {
        console.log(error);
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

  truncate(text: string, maxLength: number) {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  }

  downloadFile(url: string, filename: string): void {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
      });
  }

}
