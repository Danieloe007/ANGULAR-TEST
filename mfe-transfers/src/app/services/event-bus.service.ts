import { Injectable } from '@angular/core';

export interface TransferSuccessPayload {
  amount: number;
  timestamp: Date;
  transactionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  emitTransferSuccess(payload: TransferSuccessPayload): void {
    const event = new CustomEvent('transfer-success', {
      detail: payload,
      bubbles: true,
      composed: true
    });
    
    window.dispatchEvent(event);
    console.log('Transfer success event emitted:', payload);
  }
}
