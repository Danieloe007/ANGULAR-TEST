import { Component, OnInit, ViewChild, ViewContainerRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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
      // Manual approach: Load MFE component from global function
      if (typeof window !== 'undefined' && (window as any).getMfeTransfersComponent) {
        const TransferComponent = await (window as any).getMfeTransfersComponent();
        const componentRef = this.container.createComponent(TransferComponent);
        this.loading.set(false);
      } else {
        throw new Error('MFE not available');
      }
    } catch (err) {
      console.error('Error loading MFE:', err);
      this.error.set(err instanceof Error ? err.message : 'Unknown error');
      this.loading.set(false);
    }
  }
}
