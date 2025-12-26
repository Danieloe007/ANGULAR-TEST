import { Injectable } from '@angular/core';

export interface TransferSuccessEvent extends CustomEvent {
  detail: {
    amount: number;
    timestamp: Date;
    transactionId: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  emitTransferSuccess(data: { amount: number; timestamp: Date; transactionId: string }): void {
    const event = new CustomEvent('transfer-success', {
      detail: data
    });
    window.dispatchEvent(event);
  }
}