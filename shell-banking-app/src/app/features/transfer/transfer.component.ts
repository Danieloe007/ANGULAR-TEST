import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransferDataService } from '../../services/transfer-data.service';
import { EventBusService } from '../../services/event-bus.service';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold text-slate-900 mb-6">Nueva Transferencia</h2>

      <form [formGroup]="transferForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Source Account -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            Cuenta Origen
          </label>
          <input
            type="text"
            formControlName="sourceAccount"
            class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-banking-navy focus:border-transparent"
            placeholder="1234567890"
          />
        </div>

        <!-- Destination Account -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            Cuenta Destino
          </label>
          <input
            type="text"
            formControlName="destinationAccount"
            class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-banking-navy focus:border-transparent"
            placeholder="0987654321"
          />
          @if (transferForm.get('destinationAccount')?.errors?.['pattern'] && transferForm.get('destinationAccount')?.touched) {
            <p class="text-red-600 text-sm mt-1">Debe ser un número de 10 dígitos</p>
          }
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            Monto
          </label>
          <div class="relative">
            <span class="absolute left-4 top-3 text-slate-500">$</span>
            <input
              type="number"
              formControlName="amount"
              class="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-banking-navy focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          @if (transferForm.get('amount')?.errors?.['min'] && transferForm.get('amount')?.touched) {
            <p class="text-red-600 text-sm mt-1">El monto mínimo es $1</p>
          }
          @if (transferForm.get('amount')?.errors?.['max'] && transferForm.get('amount')?.touched) {
            <p class="text-red-600 text-sm mt-1">El monto máximo es $1,000,000</p>
          }
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            Descripción (Opcional)
          </label>
          <textarea
            formControlName="description"
            rows="3"
            class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-banking-navy focus:border-transparent"
            placeholder="Concepto de la transferencia"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          [disabled]="!transferForm.valid || submitting()"
          class="w-full bg-banking-navy text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          @if (submitting()) {
            <span>Procesando...</span>
          } @else {
            <span>Realizar Transferencia</span>
          }
        </button>
      </form>

      <!-- Success Message -->
      @if (success()) {
        <div class="mt-6 bg-banking-emerald/10 border border-banking-emerald rounded-lg p-4">
          <p class="text-banking-emerald font-semibold">✓ Transferencia exitosa</p>
          <p class="text-sm text-slate-600 mt-1">ID: {{ transactionId() }}</p>
        </div>
      }

      <!-- Error Message -->
      @if (errorMessage()) {
        <div class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">{{ errorMessage() }}</p>
        </div>
      }
    </div>
  `
})
export class TransferComponent {
  private readonly fb = inject(FormBuilder);
  private readonly transferService = inject(TransferDataService);
  private readonly eventBus = inject(EventBusService);

  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly transactionId = signal<string | null>(null);

  readonly transferForm = this.fb.group({
    sourceAccount: ['1234567890', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    destinationAccount: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    amount: [0, [Validators.required, Validators.min(1), Validators.max(1000000)]],
    description: ['']
  });

  onSubmit() {
    if (this.transferForm.invalid) return;

    this.submitting.set(true);
    this.success.set(false);
    this.errorMessage.set(null);

    const formValue = this.transferForm.value;

    this.transferService.executeTransfer({
      sourceAccount: formValue.sourceAccount!,
      destinationAccount: formValue.destinationAccount!,
      amount: formValue.amount!,
      description: formValue.description || ''
    }).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.success.set(true);
        this.transactionId.set(result.transactionId);

        // Emit event to Shell
        this.eventBus.emitTransferSuccess({
          amount: formValue.amount!,
          timestamp: new Date(),
          transactionId: result.transactionId
        });

        // Reset form after 3 seconds
        setTimeout(() => {
          this.transferForm.reset({ sourceAccount: '1234567890' });
          this.success.set(false);
        }, 3000);
      },
      error: (error) => {
        this.submitting.set(false);
        this.errorMessage.set(error.message || 'Error al procesar la transferencia');
      }
    });
  }
}