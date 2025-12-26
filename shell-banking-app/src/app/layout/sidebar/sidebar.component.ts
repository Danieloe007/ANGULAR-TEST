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
    { icon: '🏠', label: 'Inicio', route: '/home', active: false },
    { icon: '💸', label: 'Transferencias', route: '/transfers', active: true },
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
