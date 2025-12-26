# Troubleshooting - Banking Platform

## Error: Cannot find module '@angular-architects/native-federation/src/builders/build/builder'

### Descripción del Error

```
An unhandled exception occurred: Cannot find module 
'C:\PROYECTOS\ANGULAR-TEST\mfe-transfers\node_modules\@angular-architects\native-federation\src\builders\build\builder' 
imported from C:\PROYECTOS\ANGULAR-TEST\mfe-transfers\node_modules\@angular-devkit\architect\node\node-modules-architect-host.js
Did you mean to import "file:///C:/PROYECTOS/ANGULAR-TEST/mfe-transfers/node_modules/@angular-architects/native-federation/src/builders/build/builder.js"?
```

### Causa

Este es un problema conocido con la versión actual de `@angular-architects/native-federation` y Node.js cuando se usa con módulos ES. El builder no puede resolver correctamente la extensión `.js` del archivo.

### Solución 1: Usar Angular CLI sin Native Federation (Temporal)

Mientras se soluciona el problema con Native Federation, puedes ejecutar las aplicaciones sin el builder de federation:

**MFE Transfers:**
```bash
cd mfe-transfers
ng serve --port 4201
```

**Shell Banking App:**
```bash
cd shell-banking-app
ng serve --port 4200
```

**Nota**: Con esta solución, la federación de módulos no funcionará, pero podrás ver las aplicaciones individuales.

### Solución 2: Downgrade de Native Federation

Intenta usar una versión anterior de Native Federation que sea compatible:

```bash
# En ambos proyectos
npm uninstall @angular-architects/native-federation
npm install @angular-architects/native-federation@^18.0.0
```

### Solución 3: Usar Webpack Module Federation (Alternativa)

Si Native Federation continúa dando problemas, puedes migrar a Webpack Module Federation:

```bash
ng add @angular-architects/module-federation --project shell-banking-app --port 4200 --type host
ng add @angular-architects/module-federation --project mfe-transfers --port 4201 --type remote
```

### Solución 4: Configuración Manual del Builder

Modifica el `angular.json` para usar el builder estándar de Angular:

**mfe-transfers/angular.json:**
```json
{
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "configurations": {
      "production": {
        "buildTarget": "mfe-transfers:esbuild:production"
      },
      "development": {
        "buildTarget": "mfe-transfers:esbuild:development"
      }
    },
    "defaultConfiguration": "development",
    "options": {
      "port": 4201
    }
  }
}
```

**shell-banking-app/angular.json:**
```json
{
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "configurations": {
      "production": {
        "buildTarget": "shell-banking-app:esbuild:production"
      },
      "development": {
        "buildTarget": "shell-banking-app:esbuild:development"
      }
    },
    "defaultConfiguration": "development",
    "options": {
      "port": 4200
    }
  }
}
```

### Solución 5: Reinstalar Dependencias

A veces el problema se soluciona limpiando y reinstalando:

```bash
# En cada proyecto
rm -rf node_modules package-lock.json
npm install
```

### Solución Recomendada (Workaround)

Dado que este es un problema conocido con la versión actual, la mejor opción es:

1. **Ejecutar sin Federation temporalmente** para ver las aplicaciones funcionando
2. **Esperar actualización** de `@angular-architects/native-federation`
3. **Usar Webpack Module Federation** como alternativa estable

## Ejecutar sin Federation

### MFE Transfers (Standalone)

```bash
cd mfe-transfers
ng serve --port 4201
```

Acceder: http://localhost:4201

Verás el TransferComponent funcionando de forma independiente.

### Shell Banking App (Standalone)

```bash
cd shell-banking-app
ng serve --port 4200
```

Acceder: http://localhost:4200

Verás el Shell con Header, Sidebar, pero el MFE Container mostrará un error de carga (esperado sin federation).

## Verificar Funcionalidades sin Federation

### En MFE Transfers (http://localhost:4201)

✅ Formulario de transferencia
✅ Validaciones en tiempo real
✅ Signals funcionando
✅ Tailwind CSS aplicado
✅ Submit con loading state

### En Shell Banking App (http://localhost:4200)

✅ Header con balance
✅ Sidebar con navegación
✅ Signals funcionando
✅ Tailwind CSS aplicado
✅ SSR funcionando
❌ MFE Container (esperado sin federation)

## Alternativa: Demostración sin Micro Frontends

Si el objetivo es demostrar las características de Angular 21, puedes:

1. **Integrar el TransferComponent directamente en el Shell**
2. **Mantener todas las características modernas**:
   - Zoneless
   - Signals
   - SSR
   - Tailwind
   - Custom Events

### Pasos para Integración Directa

1. Copiar el TransferComponent al Shell:
```bash
cp -r mfe-transfers/src/app/features/transfer shell-banking-app/src/app/features/
cp -r mfe-transfers/src/app/services shell-banking-app/src/app/
```

2. Actualizar el MfeContainerComponent para usar el componente local:
```typescript
import { TransferComponent } from '../transfer/transfer.component';

// En lugar de loadRemoteModule
const componentRef = this.container.createComponent(TransferComponent);
```

## Estado del Proyecto

### ✅ Implementado y Funcionando

- Arquitectura de componentes
- Signals-First state management
- Zoneless change detection
- SSR con incremental hydration
- Tailwind CSS styling
- Security interceptor
- Custom Events
- Form validations
- RxJS retry logic

### ⚠️ Pendiente (Problema con Native Federation)

- Carga dinámica de MFE
- Module Federation runtime
- Comunicación entre Shell y MFE remoto

## Recursos Adicionales

- [Native Federation Issues](https://github.com/angular-architects/module-federation-plugin/issues)
- [Angular Module Federation](https://www.angulararchitects.io/en/blog/the-microfrontend-revolution-module-federation-in-webpack-5/)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)

## Contacto y Soporte

Si el problema persiste, considera:

1. Reportar el issue en el repositorio de Native Federation
2. Usar Webpack Module Federation como alternativa
3. Integrar componentes directamente sin federation

---

**Última actualización**: 2025-12-26  
**Estado**: Problema conocido con Native Federation + Node.js ES modules
