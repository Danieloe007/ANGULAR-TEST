import { Injectable, signal, computed, effect } from '@angular/core';

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
export class BalanceService {
  // Initial balance
  private readonly _balance = signal<number>(50000.00);
  
  // Public readonly signal
  readonly balance = this._balance.asReadonly();
  
  // Computed formatted balance
  readonly formattedBalance = computed(() => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(this._balance());
  });

  constructor() {
    // Listen for transfer success events
    this.setupEventListener();
    
    // Optional: Log balance changes
    effect(() => {
      console.log('Balance updated:', this.formattedBalance());
    });
  }

  private setupEventListener(): void {
    window.addEventListener('transfer-success', ((event: TransferSuccessEvent) => {
      const { amount } = event.detail;
      this.deductBalance(amount);
    }) as EventListener);
  }

  deductBalance(amount: number): void {
    this._balance.update(current => current - amount);
  }

  addBalance(amount: number): void {
    this._balance.update(current => current + amount);
  }

  setBalance(amount: number): void {
    this._balance.set(amount);
  }
}
