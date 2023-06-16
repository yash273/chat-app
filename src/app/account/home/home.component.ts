import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../user.service';
import { FormControl } from '@angular/forms';
import { combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
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
    map(([value, chat]) => chat.find((c) => c.id === value[0]))).subscribe((res) => { this.selectedChat = res });

  messages$ = this.chatListControl.valueChanges.pipe(
    map(value => value[0]),
    switchMap(chatId => this.chatService.getChatMessages(chatId)),
    tap(() => {
      this.scrollingToBottom()
    })
  )


  constructor(
    private userService: UserService,
    private chatService: ChatService,
  ) { }

  ngOnInit(): void {
    this.userService.currentUserProfile$.subscribe((res) => { this.currentUser = res });

    //     if (this.currentUser !== null) {
    // // debugger
    //     this.chatService.listenTypingStatus(this.currentUser.uid,this.selectedChat.id, (isTyping: boolean) =>
    //     {this.isTyping = isTyping; })
    //     }
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
    const imgURL = '';
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
    }, 100)
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

  closeCurrentChat(chatId: string) {
    this.chatService.closeCurrentChat(chatId).subscribe();
    chatId = ''
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
    let scrollTop = event.target.scrollTop;
    // const scrollHeight = event.target.scrollHeight;
    // const clientHeight = event.target.clientHeight;
    if (scrollTop) {
      console.log(scrollTop, "sctop0")

    }
    console.log(scrollTop, "sctop")
  }

}
