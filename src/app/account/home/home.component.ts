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
    map(([value, chat]) => chat.find((c) => c.id === value[0])));

  messages$ = this.chatListControl.valueChanges.pipe(
    map(value => value[0]),
    switchMap(chatId => this.chatService.getChatMessages(chatId)),
    tap(() => {
      this.scrollingToBottom()
    })
  )
  currentUser!: userProfile | null;
  // selectedChat!: Chat;

  constructor(
    private userService: UserService,
    private chatService: ChatService,
  ) { }

  ngOnInit(): void {
    this.userService.currentUserProfile$.subscribe((res) => { this.currentUser = res });

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
    this.chatService.lastSeenMessages(selectedChatId)
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

  lastSeenMessages(chatId: string) {
    this.chatService.lastSeenMessages(chatId).subscribe();
    this.chatClose();
  }
  isMessageSeen(message: Message): boolean {
    // Implement your logic to determine if the message has been seen or not
    // For example, you can compare the lastMessageUserId with the current user's ID
    return message.senderId === this.currentUser?.uid;
  }

}
