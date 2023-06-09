import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../user.service';
import { FormControl } from '@angular/forms';
import { combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { userProfile } from '../../interfaces/user';
import { ChatService } from './chat.service';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';


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

  constructor(
    private userService: UserService,
    private chatService: ChatService,
  ) { }

  ngOnInit(): void {
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

  sendMessage() {
    const message = this.messageControl.value;
    const selectedChatId = this.chatListControl.value[0];
    if (message && selectedChatId) {
      this.chatService.createMessages(selectedChatId, message).subscribe(() => {
        this.scrollingToBottom();
      })
      this.messageControl.setValue('');
    }
  }

  scrollingToBottom() {
    setTimeout(() => {
      if (this.endOfChat) {
        this.endOfChat.nativeElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  // isChatClosed: boolean = false;

  // chatClose() {
  //   if (window.innerWidth <= 991) {
  //     this.isChatClosed = !this.isChatClosed;
  //   }
  // }

  chatClose() {
    this.chatService.chatClose()
  }


  handleSelection(event: { char: any; }) {
    // console.log(event.char);
    this.messageControl.setValue(this.messageControl.value + event.char);
  }
}
