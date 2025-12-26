# Banking Platform - Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the Micro Frontend banking platform. Follow these steps in order to ensure proper setup and integration.

---

## Prerequisites

### Required Software

- Node.js: v18.19.0 or higher
- npm: v10.0.0 or higher
- Angular CLI: v21.0.0 or higher
- Git: Latest version

### Install Angular CLI

```bash
npm install -g @angular/cli@21
```

---

## Phase 1: Project Initialization

### Step 1: Create Shell Banking App

```bash
# Create new Angular application with SSR
ng new shell-banking-app --ssr --style=css --routing=true --skip-git=true

cd shell-banking-app

# Install Native Federation
ng add @angular-architects/native-federation --project shell-banking-app --port 4200 --type host

# Install Tailwind CSS
npm install -D tailwindcss@next @tailwindcss/postcss@next postcss autoprefixer
npx tailwindcss init
```

### Step 2: Create MFE Transfers

```bash
# Navigate back to root
cd ..

# Create new Angular application
ng new mfe-transfers --ssr=false --style=css --routing=false --skip-git=true

cd mfe-transfers

# Install Native Federation
ng add @angular-architects/native-federation --project mfe-transfers --port 4201 --type remote

# Install Tailwind CSS
npm install -D tailwindcss@next @tailwindcss/postcss@next postcss autoprefixer
npx tailwindcss init
```

---

## Phase 2: Configure Zoneless Mode

### Shell Banking App

**File**: [`app.config.ts`](shell-banking-app/src/app/app.config.ts)

```typescript
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { securityInterceptor } from './core/interceptors/security.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withIncrementalHydration()),
    provideHttpClient(
      withFetch(),
      withInterceptors([securityInterceptor])
    )
  ]
};
```

### MFE Transfers

**File**: [`app.config.ts`](mfe-transfers/src/app/app.config.ts)

```typescript
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { securityInterceptor } from './core/interceptors/security.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideHttpClient(
      withFetch(),
      withInterceptors([securityInterceptor])
    )
  ]
};
```

---

## Phase 3: Tailwind CSS Configuration

### Shell Banking App

**File**: [`tailwind.config.js`](shell-banking-app/tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'banking-navy': '#1e3a8a',
        'banking-slate': '#64748b',
        'banking-emerald': '#059669',
        'banking-amber': '#d97706',
        'banking-red': '#dc2626',
      }
    },
  },
  plugins: [],
}
```

**File**: [`src/styles.css`](shell-banking-app/src/styles.css)

```css
@import 'tailwindcss';

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 font-sans;
  }
}
```

### MFE Transfers

Same configuration as Shell Banking App.

---

## Phase 4: Native Federation Setup

### Shell Banking App (Host)

**File**: [`federation.config.js`](shell-banking-app/federation.config.js)

```javascript
const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'shell-banking-app',
  
  shared: {
    ...shareAll({ 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ]
});
```

**File**: [`public/federation.manifest.json`](shell-banking-app/public/federation.manifest.json)

```json
{
  "mfe-transfers": "http://localhost:4201/remoteEntry.json"
}
```

### MFE Transfers (Remote)

**File**: [`federation.config.js`](mfe-transfers/federation.config.js)

```javascript
const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'mfe-transfers',
  
  exposes: {
    './Component': './src/app/features/transfer/transfer.component.ts',
  },

  shared: {
    ...shareAll({ 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ]
});
```

---

## Phase 5: Core Services Implementation

### Balance Service (Shell)

**File**: [`balance.service.ts`](shell-banking-app/src/app/core/services/balance.service.ts)

```typescript
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
```

### Authentication Service (Shell)

**File**: [`auth.service.ts`](shell-banking-app/src/app/core/services/auth.service.ts)

```typescript
import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _user = signal<User | null>({
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    accountNumber: '1234567890'
  });

  private readonly _token = signal<string | null>('mock-jwt-token-12345');

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  login(email: string, password: string): void {
    // Mock login
    this._user.set({
      id: '1',
      name: 'Juan Pérez',
      email: email,
      accountNumber: '1234567890'
    });
    this._token.set('mock-jwt-token-12345');
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
  }

  getToken(): string | null {
    return this._token();
  }
}
```

### Security Interceptor (Shell)

**File**: [`security.interceptor.ts`](shell-banking-app/src/app/core/interceptors/security.interceptor.ts)

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Request-ID': crypto.randomUUID(),
        'X-Client-Version': '1.0.0'
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
```

---

## Phase 6: Layout Components (Shell)

### Header Component

**File**: [`header.component.ts`](shell-banking-app/src/app/layout/header/header.component.ts)

```typescript
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
```

### Sidebar Component

**File**: [`sidebar.component.ts`](shell-banking-app/src/app/layout/sidebar/sidebar.component.ts)

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-64 bg-white shadow-lg h-full">
      <nav class="p-4">
        <ul class="space-y-2">
          @for (item of menuItems(); track item.route) {
            <li>
              <button
                (click)="setActive(item.route)"
                [class.bg-banking-navy]="item.active"
                [class.text-white]="item.active"
                [class.text-slate-700]="!item.active"
                [class.hover:bg-slate-100]="!item.active"
                class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
              >
                <span class="text-xl">{{ item.icon }}</span>
                <span class="font-medium">{{ item.label }}</span>
              </button>
            </li>
          }
        </ul>
      </nav>
    </aside>
  `
})
export class SidebarComponent {
  readonly menuItems = signal<MenuItem[]>([
    { icon: '🏠', label: 'Inicio', route: '/home', active: true },
    { icon: '💸', label: 'Transferencias', route: '/transfers', active: false },
    { icon: '💳', label: 'Tarjetas', route: '/cards', active: false },
    { icon: '📊', label: 'Inversiones', route: '/investments', active: false },
    { icon: '⚙️', label: 'Configuración', route: '/settings', active: false },
  ]);

  setActive(route: string): void {
    this.menuItems.update(items =>
      items.map(item => ({
        ...item,
        active: item.route === route
      }))
    );
  }
}
```

---

## Phase 7: MFE Container (Shell)

**File**: [`mfe-container.component.ts`](shell-banking-app/src/app/features/mfe-container/mfe-container.component.ts)

```typescript
import { Component, OnInit, ViewChild, ViewContainerRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/native-federation';

@Component({
  selector: 'app-mfe-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-lg p-6">
      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-banking-navy"></div>
        </div>
      }
      
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">Error al cargar el módulo: {{ error() }}</p>
        </div>
      }
      
      <div #mfeContainer></div>
    </div>
  `
})
export class MfeContainerComponent implements OnInit {
  @ViewChild('mfeContainer', { read: ViewContainerRef }) 
  container!: ViewContainerRef;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit() {
    try {
      const module = await loadRemoteModule({
        remoteName: 'mfe-transfers',
        exposedModule: './Component'
      });

      const componentRef = this.container.createComponent(module.TransferComponent);
      this.loading.set(false);
    } catch (err) {
      console.error('Error loading MFE:', err);
      this.error.set(err instanceof Error ? err.message : 'Unknown error');
      this.loading.set(false);
    }
  }
}
```

---

## Phase 8: Transfer Component (MFE)

### Transfer Component

**File**: [`transfer.component.ts`](mfe-transfers/src/app/features/transfer/transfer.component.ts)

```typescript
import { Component, inject, signal, computed } from '@angular/core';
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

  async onSubmit() {
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
```

### Transfer Data Service (MFE)

**File**: [`transfer-data.service.ts`](mfe-transfers/src/app/services/transfer-data.service.ts)

```typescript
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
```

### Event Bus Service (MFE)

**File**: [`event-bus.service.ts`](mfe-transfers/src/app/services/event-bus.service.ts)

```typescript
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
```

---

## Phase 9: Main App Component (Shell)

**File**: [`app.component.ts`](shell-banking-app/src/app/app.component.ts)

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { MfeContainerComponent } from './features/mfe-container/mfe-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    MfeContainerComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-header />
      
      <div class="flex">
        <app-sidebar />
        
        <main class="flex-1 p-8">
          <app-mfe-container />
        </main>
      </div>
    </div>
  `
})
export class AppComponent {}
```

---

## Phase 10: Running the Applications

### Start Shell Application

```bash
cd shell-banking-app
npm start
```

Access at: http://localhost:4200

### Start MFE Transfers

```bash
cd mfe-transfers
npm start
```

Access at: http://localhost:4201

---

## Verification Checklist

- [ ] Shell app loads on port 4200
- [ ] MFE loads on port 4201
- [ ] Header displays initial balance
- [ ] Sidebar navigation is visible
- [ ] Transfer form renders in MFE container
- [ ] Form validation works correctly
- [ ] Transfer submission shows loading state
- [ ] Success message appears after transfer
- [ ] Balance updates in header after transfer
- [ ] Custom event communication works
- [ ] Bearer token added to requests (check Network tab)
- [ ] Tailwind styles applied correctly
- [ ] Responsive design works on mobile

---

## Troubleshooting

### Common Issues

**Issue**: MFE fails to load
- **Solution**: Ensure both apps are running and federation.manifest.json has correct URL

**Issue**: Balance doesn't update
- **Solution**: Check browser console for custom event emission and listener

**Issue**: Styles not applied
- **Solution**: Verify Tailwind configuration and ensure styles.css imports are correct

**Issue**: Form validation not working
- **Solution**: Check ReactiveFormsModule is imported in TransferComponent

---

## Next Steps

After successful implementation:

1. Add unit tests for services and components
2. Implement E2E tests with Cypress or Playwright
3. Add error boundaries and fallback UI
4. Implement analytics tracking
5. Add accessibility features (ARIA labels, keyboard navigation)
6. Optimize bundle sizes
7. Set up CI/CD pipeline
8. Configure production environment

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-26
