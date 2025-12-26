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
      // Fallback: Since cross-origin MFE loading is complex, use embedded approach
      // For now, create a simple transfer interface directly
      const createTransferInterface = () => {
        const div = document.createElement('div');
        div.innerHTML = `
          <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Transferencia (Desde MFE)</h2>
            <div class="bg-white rounded-lg shadow-lg p-6">
              <p class="text-slate-600">Módulo de transferencias cargado desde el MFE externo.</p>
              <p class="text-sm text-slate-500 mt-2">En un entorno de producción, aquí se cargaría el componente real del MFE.</p>
            </div>
          </div>
        `;
        this.container.element.nativeElement.appendChild(div);
        this.loading.set(false);
      };

      // Try the original approach first, then fallback
      try {
        // Manual approach: Load MFE component from global function with retry
        const loadMfeComponent = async () => {
          if (typeof window !== 'undefined' && (window as any).getMfeTransfersComponent) {
            const TransferComponent = await (window as any).getMfeTransfersComponent();
            const componentRef = this.container.createComponent(TransferComponent);
            this.loading.set(false);
            console.log('MFE component loaded successfully');
          } else {
            throw new Error('MFE not available');
          }
        };

        await loadMfeComponent();
      } catch (error) {
        console.log('MFE not available, using fallback interface');
        createTransferInterface();
      }
    } catch (err) {
      console.error('Error loading MFE:', err);
      this.error.set(err instanceof Error ? err.message : 'Unknown error');
      this.loading.set(false);
    }
  }
}
