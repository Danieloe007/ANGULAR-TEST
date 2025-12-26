import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, retry, catchError } from 'rxjs/operators';

export interface TransferRequest {
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  description: string;
}

export interface TransferResponse {
  success: boolean;
  transactionId: string;
  timestamp: Date;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransferDataService {
  executeTransfer(request: TransferRequest): Observable<TransferResponse> {
    // Simulate HTTP request with delay
    return this.mockHttpRequest(request).pipe(
      delay(1500), // Simulate network delay
      retry({
        count: 3,
        delay: 1000
      }),
      catchError(error => {
        console.error('Transfer failed:', error);
        return throwError(() => new Error('No se pudo completar la transferencia. Intente nuevamente.'));
      })
    );
  }

  private mockHttpRequest(request: TransferRequest): Observable<TransferResponse> {
    // Simulate 90% success rate
    const shouldSucceed = Math.random() > 0.1;

    if (shouldSucceed) {
      return of({
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        message: 'Transferencia realizada exitosamente'
      });
    } else {
      return throwError(() => new Error('Error de red simulado'));
    }
  }
}
