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
