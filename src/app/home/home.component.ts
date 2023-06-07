import { Component, OnInit } from '@angular/core';
import { UserService } from '../account/user.service';
import { FormControl } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { userProfile } from '../interfaces/user';
import { ChatService } from './chat.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  searchControl = new FormControl('');
  chatListControl = new FormControl('');
  messageControl = new FormControl('');

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
    switchMap(chatId => this.chatService.getChatMessages$(chatId))
  )

  constructor(
    private userService: UserService,
    private chatService: ChatService
  ) { }

  ngOnInit(): void {
  }

  createChat(chatUser: userProfile) {
    this.chatService.createChat(chatUser).subscribe();
  }

  sendMessage() {
    const message = this.messageControl.value;
    const selectedChatId = this.chatListControl.value[0];
    // debugger
    if (message && selectedChatId) {
      this.chatService.createMessages$(selectedChatId, message).subscribe()
      this.messageControl.setValue('');
    }
  }

}
