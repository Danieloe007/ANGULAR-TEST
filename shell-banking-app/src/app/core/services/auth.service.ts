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
