import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MaterialModule } from '../material/material.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component'
import { NavbarComponent } from '../components/navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { DateDisplayPipe } from '../pipes/date-display.pipe';
import { NgxEmojiPickerModule } from 'ngx-emoji-picker';
import { LoaderComponent } from '../components/loader/loader.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    NavbarComponent,
    HomeComponent,
    DateDisplayPipe,
    LoaderComponent
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxEmojiPickerModule,

  ],
  providers: [],
})
export class AccountModule { }
