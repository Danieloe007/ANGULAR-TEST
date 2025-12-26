# Banking Platform - Micro Frontend con Angular 21

Plataforma bancaria moderna construida con Angular 21, utilizando arquitectura de Micro Frontends con Native Federation.

## 🚀 Características Principales

- ✅ **Angular 21** con Zoneless Change Detection
- ✅ **Signals-First** para estado reactivo
- ✅ **Native Federation** para Micro Frontends
- ✅ **SSR con Incremental Hydration**
- ✅ **Tailwind CSS** con paleta profesional bancaria
- ✅ **Security Interceptor** con Bearer Token
- ✅ **Custom Events** para comunicación entre MFEs

## 📁 Estructura del Proyecto

```
angular-test/
├── plans/                          # Documentación arquitectónica
├── shell-banking-app/              # Host (Puerto 4200)
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── balance.service.ts
│   │   │   │   └── auth.service.ts
│   │   │   └── interceptors/
│   │   │       └── security.interceptor.ts
│   │   ├── layout/
│   │   │   ├── header/
│   │   │   └── sidebar/
│   │   └── features/
│   │       └── mfe-container/
│   └── public/
│       └── federation.manifest.json
│
└── mfe-transfers/                  # Remote (Puerto 4201)
    ├── src/app/
    │   ├── features/
    │   │   └── transfer/
    │   │       └── transfer.component.ts
    │   └── services/
    │       ├── transfer-data.service.ts
    │       └── event-bus.service.ts
    └── federation.config.js
```

## 🛠️ Instalación y Ejecución

### Prerrequisitos

- Node.js v18.19.0 o superior
- npm v10.0.0 o superior
- Angular CLI v21.0.0

### Paso 1: Instalar dependencias

```bash
# Shell Banking App
cd shell-banking-app
npm install

# MFE Transfers
cd ../mfe-transfers
npm install
```

### Paso 2: Ejecutar las aplicaciones

**Terminal 1 - Shell Banking App (Host)**
```bash
cd shell-banking-app
npm start
```
Acceder en: http://localhost:4200

**Terminal 2 - MFE Transfers (Remote)**
```bash
cd mfe-transfers
npm start
```
Acceder en: http://localhost:4201

## 🎯 Funcionalidades Implementadas

### Shell Banking App

1. **Header Component**
   - Muestra el saldo global usando Signals
   - Información del usuario autenticado
   - Actualización reactiva del saldo

2. **Sidebar Component**
   - Navegación con menú interactivo
   - Estado activo con Signals
   - Diseño responsive

3. **Balance Service**
   - Signal para saldo global
   - Computed signal para formato de moneda
   - Event listener para actualizaciones

4. **Auth Service**
   - Autenticación simulada
   - Token management
   - User profile con Signals

5. **Security Interceptor**
   - Inyección automática de Bearer token
   - Headers personalizados (Request ID, Client Version)

### MFE Transfers

1. **Transfer Component**
   - Formulario reactivo con validaciones
   - Signal Forms para estado del formulario
   - Validaciones en tiempo real

2. **Transfer Data Service**
   - Simulación de peticiones HTTP con RxJS
   - Retry logic (3 intentos)
   - Delay para simular latencia de red

3. **Event Bus Service**
   - Emisión de Custom Events
   - Comunicación desacoplada con el Shell

## 🔄 Flujo de Transferencia

1. Usuario completa el formulario de transferencia
2. Validaciones en tiempo real con Signals
3. Al enviar, se ejecuta la transferencia (simulada)
4. Retry automático en caso de fallo
5. Al éxito, se emite un Custom Event
6. El Shell escucha el evento y actualiza el saldo
7. El Header muestra el nuevo saldo automáticamente

## 🎨 Paleta de Colores

```css
banking-navy:    #1e3a8a  /* Azul marino - Confianza */
banking-slate:   #64748b  /* Gris pizarra - Profesional */
banking-emerald: #059669  /* Esmeralda - Éxito */
banking-amber:   #d97706  /* Ámbar - Advertencia */
banking-red:     #dc2626  /* Rojo - Error */
```

## 📊 Arquitectura Técnica

### Zoneless Change Detection

```typescript
provideExperimentalZonelessChangeDetection()
```

Elimina Zone.js para mejor rendimiento y bundle más pequeño.

### Signals-First State Management

```typescript
// Balance Service
private readonly _balance = signal<number>(50000.00);
readonly balance = this._balance.asReadonly();
readonly formattedBalance = computed(() => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(this._balance());
});
```

### Native Federation

```javascript
// MFE expone el componente
exposes: {
  './Component': './src/app/features/transfer/transfer.component.ts'
}

// Shell carga dinámicamente
const module = await loadRemoteModule({
  remoteName: 'mfe-transfers',
  exposedModule: './Component'
});
```

### Custom Events Communication

```typescript
// MFE emite evento
window.dispatchEvent(new CustomEvent('transfer-success', {
  detail: { amount, timestamp, transactionId }
}));

// Shell escucha evento
window.addEventListener('transfer-success', (event) => {
  this.deductBalance(event.detail.amount);
});
```

## 🧪 Verificación

### Checklist de Funcionalidades

- [ ] Shell carga en puerto 4200
- [ ] MFE carga en puerto 4201
- [ ] Header muestra saldo inicial: $50,000.00
- [ ] Sidebar muestra navegación
- [ ] Formulario de transferencia se renderiza
- [ ] Validaciones funcionan correctamente
- [ ] Transferencia muestra estado de carga
- [ ] Mensaje de éxito aparece
- [ ] Saldo se actualiza en el header
- [ ] Console muestra evento custom
- [ ] Bearer token en Network tab

## 📚 Documentación Adicional

- [`plans/banking-platform-architecture.md`](plans/banking-platform-architecture.md) - Arquitectura completa
- [`plans/implementation-guide.md`](plans/implementation-guide.md) - Guía de implementación
- [`plans/technical-decisions.md`](plans/technical-decisions.md) - Decisiones técnicas

## 🚧 Próximos Pasos

1. Agregar tests unitarios
2. Implementar tests E2E
3. Agregar más MFEs (Cuentas, Tarjetas)
4. Implementar routing
5. Agregar autenticación real
6. Configurar CI/CD
7. Deploy a producción

## 🐛 Troubleshooting

### MFE no carga

**Problema**: Error al cargar el módulo remoto

**Solución**: 
1. Verificar que ambos servidores estén corriendo
2. Revisar `federation.manifest.json` tiene la URL correcta
3. Verificar console del navegador para errores

### Saldo no se actualiza

**Problema**: El saldo no cambia después de la transferencia

**Solución**:
1. Abrir DevTools Console
2. Verificar que se emite el evento `transfer-success`
3. Verificar que el BalanceService tiene el listener configurado

### Estilos no se aplican

**Problema**: Tailwind CSS no funciona

**Solución**:
1. Verificar que `tailwind.config.js` existe
2. Verificar que `styles.css` tiene las directivas `@tailwind`
3. Reiniciar el servidor de desarrollo

## 📄 Licencia

Este proyecto es una demostración educativa de arquitectura Micro Frontend con Angular 21.

---

**Versión**: 1.0.0  
**Última actualización**: 2025-12-26  
**Estado**: ✅ Implementación Completa
