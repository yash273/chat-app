import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertComponent } from './alert.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private snackBar: MatSnackBar) { }

  showAlert(message: string, alertType: 'default' | 'error' | 'success') {
    this.snackBar.openFromComponent(AlertComponent, {
      data: {
        message: message,
      },
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: alertType
    })
  }
}
