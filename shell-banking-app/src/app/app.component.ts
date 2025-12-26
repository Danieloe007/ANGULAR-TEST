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
