import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceService } from '../../core/services/balance.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-banking-navy text-white shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-banking-emerald rounded-lg flex items-center justify-center">
              <span class="text-2xl font-bold">B</span>
            </div>
            <h1 class="text-xl font-bold">Banking Digital</h1>
          </div>

          <!-- Balance Display -->
          <div class="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
            <p class="text-xs text-white/70 mb-1">Saldo Disponible</p>
            <p class="text-2xl font-bold">{{ balanceService.formattedBalance() }}</p>
          </div>

          <!-- User Profile -->
          @if (authService.user(); as user) {
            <div class="flex items-center space-x-3">
              <div class="text-right">
                <p class="font-semibold">{{ user.name }}</p>
                <p class="text-xs text-white/70">{{ user.accountNumber }}</p>
              </div>
              <div class="w-10 h-10 bg-banking-emerald rounded-full flex items-center justify-center">
                <span class="text-lg font-bold">{{ user.name.charAt(0) }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly balanceService = inject(BalanceService);
  readonly authService = inject(AuthService);
}
