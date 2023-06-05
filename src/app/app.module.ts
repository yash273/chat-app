import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccountModule } from './account/account.module'
import { environment } from "../environments/environment";
import { AngularFireModule } from '@angular/fire';
// import { AngularFireModule } from '@angular/fire';
// import { AngularFireModule } from "@angular/fire";
// import { AngularFirestoreModule } from "@angular/fire/firestore";/
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AccountModule,
    // AngularFireModule.initializeApp(environment.firebaseConfig),
    // AngularFireModule,
    // AngularFireModule.initializeApp(environment.firebaseConfig),
    // AngularFirestoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
