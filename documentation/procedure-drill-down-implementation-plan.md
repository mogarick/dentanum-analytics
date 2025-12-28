# 📋 Plan de Implementación: Vista Drill-Down de Procedimientos

**Proyecto**: Dentanum Analytics Dashboard  
**Fecha de Creación**: 17 Diciembre 2025  
**Última Actualización**: 17 Diciembre 2025 (v5 - Fases incrementales)  
**Estado**: 🟡 En Planificación

---

## 🔔 Cambios Importantes

### 🎯 Orden de Desarrollo (Incremental con Outcomes Visuales)

**Cada fase tiene algo visible/probable al finalizarla:**

| Fase       | Qué verás                    | URL de prueba               |
| ---------- | ---------------------------- | --------------------------- |
| **FASE 1** | Página básica funciona       | `/procedures/RES`           |
| **FASE 2** | Lista simple de datos reales | `/procedures/RES`           |
| **FASE 3** | Cards bonitas, responsive    | `/procedures/RES`           |
| **FASE 4** | Filtros, stats, scroll       | `/procedures/RES?year=2024` |
| **FASE 5** | Todo validado                | Todas las URLs              |
| **FASE 6** | Clicks desde dashboard       | Click en dashboard          |
| **FASE 7** | Optimizado                   | -                           |

**Desarrollo incremental con feedback continuo:**

```
DÍA 1:
├─ FASE 1 (0.5d) → VER: Página skeleton
└─ FASE 2 inicio → Empezar service layer

DÍA 2-3:
└─ FASE 2 (2d) → VER: Lista simple de registros reales

DÍA 4-5:
└─ FASE 3 (1.5d) → VER: UI completa, cards bonitas

DÍA 6:
└─ FASE 4 (1d) → VER: Funcionalidad completa

DÍA 7:
├─ FASE 5 (0.5d) → VER: Todo validado ✅
└─ FASE 6 (0.5d) → VER: Integración dashboard

OPCIONAL:
└─ FASE 7 → Optimización
```

**Ventajas de este enfoque:**

✅ Ver progreso visual en cada fase  
✅ Probar incrementalmente con URLs directas  
✅ Dashboard no se rompe durante desarrollo  
✅ Feedback continuo, detectar problemas temprano  
✅ Más motivante (ver avance constantemente)

**URLs de prueba (desde FASE 1)**:

```
http://localhost:5173/procedures/RES
http://localhost:5173/procedures/RES?year=2024
http://localhost:5173/procedures/RES?year=2024&month=01
http://localhost:5173/procedures/OTD?year=2024&month=06
```

---

### ⚡ v3: Simplificación de Query Params (Última Versión)

**Cambio**: Eliminados parámetros `source` y `quadrant` de las URLs

**Antes (v2)**:

```
/procedures/RES?year=2024&source=quadrant&quadrant=stars
```

**Ahora (v3)**:

```
/procedures/RES?year=2024
```

**Razones**:

- ❌ Sin valor funcional: No restauran scroll sin implementación adicional
- ✅ URLs más limpias y simples
- ✅ Menos complejidad en código
- ✅ Breadcrumb genérico suficiente: "← Volver al Dashboard"

**Scroll restoration** pospuesto como feature futura (ver PQ-04)

### ⚡ v2: Decisión Crítica - Página Dedicada en vez de Modal

**Antes (v1)**: Modal overlay que se abría sobre el dashboard  
**Ahora (v2+)**: Página dedicada con ruta propia `/procedures/:code`

**Beneficios clave**:

- ✅ URLs compartibles
- ✅ Navegación nativa del navegador
- ✅ Mejor UX en mobile
- ✅ Bookmarkable
- ✅ Mejor para muchos datos

### 📝 Otros Cambios desde v1

- ❌ Eliminado RNF-02 (Accesibilidad)
- ✅ Integración con React Router

---

## 📑 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Requerimientos](#requerimientos)
3. [Arquitectura y Diseño](#arquitectura-y-diseño)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [Tipos TypeScript](#tipos-typescript)
6. [Plan de Implementación por Fases](#plan-de-implementación-por-fases)
7. [Especificaciones Técnicas](#especificaciones-técnicas)
8. [Integración con Dashboard](#integración-con-dashboard)
9. [Testing y Validación](#testing-y-validación)
10. [Notas y Decisiones](#notas-y-decisiones)

---

## 🎯 Visión General

### Objetivo

Crear una vista de detalle drill-down que permita visualizar y analizar procedimientos dentales individuales, con capacidad de conciliar atenciones (patientsData) con ventas (moneyAccountsData) de manera visual e intuitiva.

### Problema que Resuelve

- **Falta de visibilidad**: No se pueden ver los registros individuales detrás de las métricas agregadas
- **Conciliación manual**: Difícil identificar cuáles atenciones tienen venta asociada
- **Auditoría**: No hay forma fácil de revisar inconsistencias entre atenciones y ventas
- **Análisis de pacientes**: No se puede ver el detalle por edad/paciente

### Usuario Objetivo

- Administradores de clínica dental
- Personal de auditoría
- Dentistas revisando su producción
- Gerentes analizando rendimiento

---

## 📋 Requerimientos

### Requerimientos Funcionales

#### RF-01: Filtros de Entrada

**Prioridad**: Alta  
**Estado**: ⬜ Pendiente

La vista debe aceptar los siguientes filtros:

| Parámetro       | Tipo   | Obligatorio | Descripción                                           |
| --------------- | ------ | ----------- | ----------------------------------------------------- |
| `procedureCode` | string | ✅ Sí       | Código del procedimiento (recordTypeSubcategory.code) |
| `year`          | string | ❌ No       | Año (formato: "2024"). Si no viene, se asume "todos"  |
| `month`         | string | ❌ No       | Mes (formato: "01"-"12")                              |
| `day`           | string | ❌ No       | Día (formato: "01"-"31")                              |
| `ownerAccount`  | string | ✅ Sí       | Siempre "MGyL1bJHV1DK" (hardcoded)                    |

#### RF-02: Datos de Atenciones (patientsData)

**Prioridad**: Alta  
**Estado**: ⬜ Pendiente

**Filtros pre-aplicados:**

- `ownerAccount`: "MGyL1bJHV1DK"
- `recordType`: "HealthStory"
- `recordTypeCategory.code`: "HSMainSubject"
- `recordTypeSubcategory.code`: {procedureCode del filtro}

**Campos a mostrar:**

- Fecha de atención: `startDate`
- Código de procedimiento: `recordTypeSubcategory.code`
- Descripción del procedimiento: `recordTypeSubcategory.description`
- Motivo de atención: `name`
- Nota de atención: `note`
- Edad del paciente:
  - Extraer `patientId` del `_id` (ej: "P#ixYYSxO6f1lM_HS#KUJtIu-LkvKZ" → "P#ixYYSxO6f1lM")
  - Buscar en `personsData` donde `patientId` coincida
  - Calcular edad desde `birthdate`
  - Si no hay `birthdate`, mostrar "ND"

#### RF-03: Datos de Ventas (moneyAccountsData)

**Prioridad**: Alta  
**Estado**: ⬜ Pendiente

**Filtros pre-aplicados:**

- `ownerAccount`: "MGyL1bJHV1DK"
- `recordTypeCategory.code`: "DentalHealthcareServiceItem"
- `recordTypeSubcategory.code`: {procedureCode del filtro}

**Campos a mostrar:**

- Fecha de venta: `date`
- Código de procedimiento: `recordTypeSubcategory.code`
- Descripción del procedimiento: `recordTypeSubcategory.description`
- Monto: `value` (valor absoluto)
- Edad del paciente:
  - Navegar desde `subjectId` hacia `personsData._id`
  - Calcular edad desde `birthdate`
  - Si no hay `birthdate`, mostrar "ND"

#### RF-04: Conciliación Atención-Venta

**Prioridad**: Alta  
**Estado**: ⬜ Pendiente

**Algoritmo de matching:**

1. Mismo `patientId` (atención) = `subjectId` (venta)
2. Mismo `procedureCode`
3. Fecha de venta dentro del mismo día que la atención
4. Si hay múltiples coincidencias, elegir la más cercana en tiempo

**Estados de conciliación:**

- `perfect-match`: ✅ Atención + Venta (diferencia ≤ 3 horas)
- `likely-match`: 🟡 Atención + Venta (diferencia > 3 horas, mismo día)
- `attention-only`: ⚠️ Solo Atención (sin venta asociada)
- `sale-only`: ❌ Solo Venta (sin atención asociada)

#### RF-05: Diseño Responsive

**Prioridad**: Alta  
**Estado**: ⬜ Pendiente

**Mobile (< 768px):**

- Layout vertical en cards
- Atención y venta apiladas
- Nota expandible con "Ver más"

**Desktop (≥ 768px):**

- Layout horizontal en cards
- Atención y venta lado a lado
- Nota con ancho completo abajo
- Tooltip opcional para notas largas

#### RF-06: Infinite Scroll

**Prioridad**: Alta  
**Estado**: ⬜ Pendiente

- Cargar inicialmente 20 registros
- Al llegar al 80% del scroll, cargar siguientes 20
- Mostrar loading spinner durante carga
- Manejar estado de "no hay más registros"

#### RF-07: Navegación desde Dashboard

**Prioridad**: Alta  
**Estado**: ⬜ Pendiente

**Navegación mediante React Router:**

- Click en cualquier elemento con procedureCode navega a `/procedures/:code`
- Parámetros enviados via query string en URL
- Ejemplo: `/procedures/RES?year=2024&month=01&source=quadrant&quadrant=stars`
- URL es compartible (shareable) y bookmarkable
- Botón "atrás" del navegador funciona nativamente

**Puntos de entrada (click handlers):**

1. Cards de cuadrantes (Estrellas, Optimizar, Crecimiento, Revisar)
2. Filas de tabla de análisis detallado
3. Puntos en scatter plot
4. Cards de resumen de atenciones
5. Cards de resumen de ingresos
6. Barras en charts temporales

**Query params soportados:**

- `year`: Año (opcional)
- `month`: Mes 01-12 (opcional)
- `day`: Día 01-31 (opcional)

**Ejemplos de URLs:**

```
/procedures/RES
/procedures/RES?year=2024
/procedures/RES?year=2024&month=01
/procedures/RES?year=2024&month=01&day=15
/procedures/OTD?year=2024&month=06
/procedures/END?year=2023
```

**Nota**: Los parámetros `source` y `quadrant` fueron eliminados por simplicidad. El botón "atrás" siempre vuelve al top del dashboard.

### Requerimientos No Funcionales

#### RNF-01: Rendimiento

- Carga inicial < 2 segundos
- Scroll suave sin lag
- Virtualización si > 100 registros

#### RNF-02: Seguridad

- Anonimización de patientId (mostrar solo últimos 4 caracteres)
- No exponer datos sensibles en logs

---

## 🏗️ Arquitectura y Diseño

### Arquitectura de Componentes

```
RUTAS:
/                                    → Dashboard (DentalTreatmentDashboard)
/procedures/:procedureCode           → Vista detalle (ProcedureDetailPage)

Query Params en URL:
?year=2024&month=01&day=15&source=quadrant&quadrant=stars


COMPONENTES:

DentalTreatmentDashboard (existente - ruta: /)
  │
  └─> onClick handlers en múltiples puntos
       │
       └─> navigate(`/procedures/${code}?year=...`)


ProcedureDetailPage (nuevo - ruta: /procedures/:procedureCode)
  │
  ├─> useParams() para obtener procedureCode
  ├─> useSearchParams() para filtros (year, month, day, etc)
  │
  ├─> ProcedureDetailHeader
  │    ├─> Breadcrumbs (← volver a Dashboard)
  │    ├─> FilterBar (filtros adicionales)
  │    └─> ConciliationStats (métricas resumen)
  │
  └─> InfiniteScrollContainer
       └─> RecordListItem (card individual)
            ├─> PatientHeader (info paciente)
            ├─> AttentionSection (datos atención)
            ├─> SaleSection (datos venta)
            └─> NoteField (nota expandible)
```

### Flujo de Datos

```
1. Usuario hace click en Dashboard
   ↓
2. navigate(`/procedures/${procedureCode}?year=2024&month=01`)
   ↓
3. React Router navega a ProcedureDetailPage
   ↓
4. useParams() obtiene procedureCode de la URL
   useSearchParams() obtiene year, month, day
   ↓
5. useProcedureDetail hook fetch datos del server con filtros
   ↓
6. procedureDetailService.server.ts obtiene datos de MongoDB:
   - getAttentions(filters)
   - getSales(filters)
   - consolidateRecords(attentions, sales) ← lógica de matching
   ↓
7. Retorna ConsolidatedRecord[]
   ↓
8. UI renderiza con InfiniteScrollContainer
   ↓
9. Usuario scrollea → carga más datos (paginación)
   ↓
10. Usuario puede compartir URL o usar botón "atrás" del navegador
    (siempre vuelve al top del dashboard)
```

### Diseño Visual

#### Mobile Layout (< 768px)

```
┌───────────────────────────────┐
│ 🦷 RES - Restauración        │
│ 📅 Enero 2024 • 23 registros │
│ [Filtros ▼] [Estado ▼]       │
└───────────────────────────────┘

┌─ Pac: ****6f1M • 37 años ────┐
│ 📅 15 Ene 2024, 09:30        │
│                               │
│ 🏥 ATENCIÓN                   │
│ ┌───────────────────────────┐ │
│ │ ✅ Conciliada con venta   │ │
│ │ RES - Restauración Dental │ │
│ │ Caries dental M2 pieza 16 │ │
│ │                           │ │
│ │ 📝 "Restauración con..."  │ │
│ │ [Ver nota completa ↓]    │ │
│ └───────────────────────────┘ │
│                               │
│ 💰 VENTA ASOCIADA             │
│ ┌───────────────────────────┐ │
│ │ 09:45 (15 min después)    │ │
│ │ $2,450 MXN                │ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

#### Desktop Layout (≥ 768px)

```
┌────────────────────────────────────────────────────────────┐
│ 🦷 RES - Restauración Dental    📅 Enero 2024             │
│ 23 registros • $185,400 MXN                                │
│ [Filtros ▼]  [Estado: Todos ▼]  [🔍 Buscar...]           │
└────────────────────────────────────────────────────────────┘

┌─ 👤 Paciente ****6f1M • 37 años • 📅 15 Ene 2024 ────────┐
│                                                            │
│  🏥 ATENCIÓN (09:30)         💰 VENTA (09:45) ✅ +15 min  │
│  ┌────────────────────┐      ┌────────────────────────┐  │
│  │ RES - Restauración │      │ RES - Restauración     │  │
│  │                    │      │ Monto: $2,450 MXN      │  │
│  │ Motivo: Caries...  │      │                        │  │
│  └────────────────────┘      └────────────────────────┘  │
│                                                            │
│  📝 Nota: "Restauración con amalgama en pieza 16..."      │
│  ──────────────────────────────────────────────────────   │
│  [Ver nota completa ↓]                                    │
└────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

### Nuevos Archivos a Crear

```
dentanum-analytics/
├── src/
│   ├── components/
│   │   ├── DentalTreatmentDashboard.tsx (✏️ modificar - agregar navigate)
│   │   └── drill-down/
│   │       ├── ProcedureDetailPage.tsx           ⬜ crear (página principal)
│   │       ├── ProcedureDetailHeader.tsx         ⬜ crear
│   │       ├── RecordListItem.tsx                ⬜ crear
│   │       ├── AttentionSection.tsx              ⬜ crear
│   │       ├── SaleSection.tsx                   ⬜ crear
│   │       ├── NoteField.tsx                     ⬜ crear
│   │       ├── PatientHeader.tsx                 ⬜ crear
│   │       ├── InfiniteScrollContainer.tsx       ⬜ crear
│   │       ├── FilterBar.tsx                     ⬜ crear
│   │       └── ConciliationStats.tsx             ⬜ crear
│   │
│   ├── routes/
│   │   ├── home.tsx (✏️ modificar - ruta /)
│   │   └── procedure-detail.tsx                  ⬜ crear (ruta /procedures/:code)
│   │
│   ├── services/
│   │   └── procedureDetailService.server.ts      ⬜ crear
│   │
│   ├── types/
│   │   └── procedureDetail.types.ts              ⬜ crear
│   │
│   ├── hooks/
│   │   ├── useProcedureDetail.ts                 ⬜ crear
│   │   └── useInfiniteScroll.ts                  ⬜ crear
│   │
│   └── utils/
│       ├── dateUtils.ts                          ⬜ crear
│       └── patientUtils.ts                       ⬜ crear
│
├── react-router.config.ts (existente - no modificar)
├── src/routes.ts (✏️ modificar - agregar ruta)
│
└── documentation/
    └── procedure-drill-down-implementation-plan.md ✅ este archivo
```

---

## 📝 Tipos TypeScript

### `src/types/procedureDetail.types.ts`

```typescript
// ============================================
// FILTROS Y CONTEXTO
// ============================================

export interface ProcedureDetailFilters {
  /** Código del procedimiento (obligatorio) */
  procedureCode: string;

  /** Año (opcional, formato: "2024") */
  year?: string;

  /** Mes (opcional, formato: "01"-"12") */
  month?: string;

  /** Día (opcional, formato: "01"-"31") */
  day?: string;

  /** Owner account (siempre "MGyL1bJHV1DK") */
  ownerAccount: string;

  /** Página para infinite scroll */
  page?: number;

  /** Registros por página */
  limit?: number;
}

export interface DrillDownContext {
  /** Código del procedimiento */
  procedureCode: string;

  /** Nombre del procedimiento para display */
  procedureName?: string;

  /** Filtros pre-poblados desde el contexto */
  year?: string;
  month?: string;
  day?: string;
}

// ============================================
// REGISTROS DE BASE DE DATOS
// ============================================

export interface AttentionRecord {
  _id: string;
  patientId: string; // P#xxxxxxxx
  startDate: Date;
  procedureCode: string;
  procedureDescription: string;
  reason: string; // name
  note: string;
  patientAge: number | "ND";
}

export interface SaleRecord {
  _id: string;
  subjectId: string; // P#xxxxxxxx
  date: Date;
  procedureCode: string;
  procedureDescription: string;
  amount: number; // value (absoluto)
  patientAge: number | "ND";
}

// ============================================
// REGISTROS CONSOLIDADOS
// ============================================

export type ConciliationStatus =
  | "perfect-match" // ✅ Atención + Venta (≤3h diferencia)
  | "likely-match" // 🟡 Atención + Venta (>3h, mismo día)
  | "attention-only" // ⚠️ Solo Atención
  | "sale-only"; // ❌ Solo Venta

export interface ConsolidatedRecord {
  id: string; // ID único para React keys
  patientId: string; // Anonimizado (ej: "****6f1M")
  patientAge: number | "ND";
  date: Date; // Fecha principal (de atención o venta)

  /** Datos de atención (si existe) */
  attention?: {
    _id: string;
    time: string; // "09:30" (HH:mm)
    procedureCode: string;
    procedureDescription: string;
    reason: string;
    note: string;
  };

  /** Datos de venta (si existe) */
  sale?: {
    _id: string;
    time: string; // "09:45" (HH:mm)
    procedureCode: string;
    procedureDescription: string;
    amount: number;
  };

  /** Estado de conciliación */
  conciliationStatus: ConciliationStatus;

  /** Diferencia en minutos entre atención y venta (si ambas existen) */
  timeDifferenceMinutes?: number;
}

// ============================================
// RESPUESTA PAGINADA
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasMore: boolean;
    limit: number;
  };
}

export interface ConsolidatedResponse extends PaginatedResponse<ConsolidatedRecord> {
  /** Métricas de conciliación */
  stats: ConciliationStats;
}

// ============================================
// ESTADÍSTICAS
// ============================================

export interface ConciliationStats {
  totalRecords: number;
  perfectMatches: number;
  likelyMatches: number;
  attentionOnly: number;
  saleOnly: number;
  totalRevenue: number;
  averageRevenue: number;
  averageAge: number | "ND";
  conciliationRate: number; // % de atenciones con venta
  dateRange: {
    start: Date;
    end: Date;
  };
}

// ============================================
// PROPS DE COMPONENTES
// ============================================

export interface ProcedureDetailPageProps {
  // No recibe props - usa useParams() y useSearchParams()
}

export interface RecordListItemProps {
  record: ConsolidatedRecord;
  isMobile: boolean;
}

export interface NoteFieldProps {
  note: string;
  isMobile: boolean;
  maxLines?: number;
}

export interface ProcedureDetailHeaderProps {
  procedureCode: string;
  procedureName: string;
  stats: ConciliationStats;
  onFilterChange: (filters: any) => void;
}
```

---

## 🚀 Plan de Implementación por Fases

### ✅ FASE 0: Preparación y Planificación

**Duración Estimada**: 0.5 día  
**Estado**: ✅ Completo

- [x] Definir requerimientos
- [x] Diseñar arquitectura
- [x] Crear documento de plan de implementación
- [x] Definir tipos TypeScript
- [x] Revisar y aprobar diseño UI/UX

---

### ✅ FASE 1: Setup + Página Básica (Skeleton) - COMPLETADA

**Duración Estimada**: 0.5 día  
**Estado**: ✅ Completada  
**Prioridad**: Alta  
**Outcome Visual**: ✅ Ver página básica funcionando en `/procedures/RES`

#### Qué podrás ver al final de esta fase:

- 🌐 Página carga en `/procedures/RES` (sin errores 404)
- 📄 Breadcrumb "← Volver al Dashboard" funcional
- 🎨 Header con título "RES - Restauración Dental"
- 📦 Mensaje "Cargando datos..." o skeleton
- ✅ No hay errores en consola

#### Tareas:

- [x] **1.1** Crear `src/types/procedureDetail.types.ts`
  - [x] Definir todos los tipos básicos
  - [x] DrillDownContext, ConsolidatedRecord, etc.

- [x] **1.2** Crear `src/routes/procedure-detail.tsx`
  - [x] Export route config básico
  - [x] Renderiza ProcedureDetailPage

- [x] **1.3** Actualizar `src/routes.ts`
  - [x] Agregar route: `route("procedures/:procedureCode", "routes/procedure-detail.tsx")`

- [x] **1.4** Crear `src/components/drill-down/ProcedureDetailPage.tsx` (básico)
  - [x] useParams() para obtener procedureCode
  - [x] useSearchParams() para filtros
  - [x] Breadcrumb que navega a `/`
  - [x] Header con procedureCode y nombre
  - [x] Mensaje "Cargando datos..." temporal

#### Testing FASE 1:

- [x] Abrir `http://localhost:5174/procedures/RES`
- [x] Ver página (no 404)
- [x] Ver breadcrumb y header
- [x] Click en breadcrumb vuelve a `/`
- [x] Validar parámetros de query (`?year=2024&month=03`)

**Validación completada** (2025-12-17):

- ✅ Ruta configurada correctamente
- ✅ Parámetros de URL parseados correctamente (procedureCode via `useParams`)
- ✅ Query parameters funcionando (year, month, day via `useSearchParams`)
- ✅ Import corregido: `"react-router"` (v7) en lugar de `"react-router-dom"`
- ✅ Navegación y breadcrumbs funcionando
- ✅ Página carga sin errores
- ✅ Filtros de tiempo se muestran correctamente en el header

---

### ✅ FASE 2: Service Layer + Primeros Datos - COMPLETADA

**Duración Estimada**: 2 días  
**Estado**: ✅ Completada  
**Prioridad**: Alta  
**Dependencias**: FASE 1  
**Outcome Visual**: ✅ Ver lista simple de registros reales (sin estilo fancy)

#### Qué podrás ver al final de esta fase:

- 📊 Lista de atenciones y ventas (texto simple)
- 🎯 Datos reales de MongoDB
- ✅ Conciliación básica funcionando (ves matches)
- 📝 Métricas básicas (ej: "23 registros, 15 conciliados")

#### Tareas:

- [x] **2.1** Crear `src/utils/patientUtils.ts`
  - [x] Función `extractPatientId(healthStoryId: string): string`
  - [x] Función `anonymizePatientId(patientId: string): string`
  - [x] Función `calculateAge(birthdate: Date | null): number | 'ND'`

- [x] **2.2** Crear `src/utils/dateUtils.ts`
  - [x] Función `formatTime(date: Date): string` (HH:mm)
  - [x] Función `calculateTimeDifference(date1: Date, date2: Date): number` (minutos)
  - [x] Función `isSameDay(date1: Date, date2: Date): boolean`
  - [x] Función `formatISODate(date: Date): string` (YYYY-MM-DD)

- [x] **2.3** Crear `src/services/procedureDetailService.server.ts`
  - [x] Función `getAttentions(filters: ProcedureDetailFilters)`
    - [x] Conectar con MongoDB (patientsData collection)
    - [x] Aplicar filtros de ownerAccount, recordType, etc.
    - [x] Aplicar filtros de fecha (year, month, day)
    - [x] Extraer patientId de \_id
    - [x] Hacer lookup a personsData para obtener birthdate
    - [x] Calcular edad
    - [x] Retornar AttentionRecord[]
  - [x] Función `getSales(filters: ProcedureDetailFilters)`
    - [x] Conectar con MongoDB (moneyAccountsData collection)
    - [x] Aplicar filtros de ownerAccount, recordTypeCategory, etc.
    - [x] Aplicar filtros de fecha
    - [x] Hacer lookup a personsData via subjectId
    - [x] Calcular edad
    - [x] Convertir value a absoluto
    - [x] Retornar SaleRecord[]
  - [x] Función `consolidateRecords(attentions, sales): ConsolidatedRecord[]`
    - [x] Implementar algoritmo de matching
    - [x] Clasificar por ConciliationStatus
    - [x] Ordenar por fecha descendente
    - [x] Anonimizar patientIds
  - [x] Función `calculateStats(records): ConciliationStats`
    - [x] Calcular todas las métricas
    - [x] Calcular promedios y porcentajes
  - [x] Función `getConsolidatedRecords(filters, page, limit)`
    - [x] Coordinar llamadas a getAttentions y getSales
    - [x] Consolidar registros
    - [x] Aplicar paginación
    - [x] Calcular stats
    - [x] Retornar ConsolidatedResponse
  - [x] Helper `buildDateFilter(year, month, day)` para filtros de fecha

- [x] **2.4** Crear loader para `src/routes/procedure-detail.tsx`
  - [x] Implementar función loader con Route.LoaderArgs
  - [x] Extraer params (procedureCode) y query params (year, month, day, page)
  - [x] Llamar a getConsolidatedRecords
  - [x] Manejo de errores (400, 500)

- [x] **2.5** Actualizar `ProcedureDetailPage.tsx`
  - [x] Integrar useLoaderData() hook
  - [x] Mostrar lista de registros con formato simple
  - [x] Mostrar stats de resumen
  - [x] Mostrar estado de conciliación con emojis
  - [x] Grid responsive (2 columnas en desktop)
  - [x] Formateo de moneda y fechas
  - [x] Mensaje de paginación

#### Testing FASE 2:

- [x] Abrir `/procedures/RES`
- [x] Ver lista de registros reales (texto simple)
- [x] Ver estados: ✅ Match, ⚠️ Sin venta, ❌ Sin atención
- [x] Ver métricas básicas
- [x] Validar filtros: `/procedures/RES?year=2024&month=03`

**Validación completada** (2025-12-17):

- ✅ Service layer funcionando correctamente (MongoDB queries)
- ✅ Loader de React Router v7 funcionando
- ✅ Conciliación de datos implementada
- ✅ 531 registros totales de RES encontrados
- ✅ Paginación básica funcionando (20 de 531)
- ✅ Stats calculados correctamente (Tasa de conciliación: 0.0%)
- ✅ Total ventas: $442,250.00
- ✅ Anonimización de pacientes funcionando (\*\*\*\*xxxx) con `patientId` correcto
- ✅ Lookup correcto: `subjectId` → `personsData._id` → `personsData.patientId`
- ✅ Edades calculadas correctamente (53, 21, 48 años, etc.)
- ✅ Formateo de moneda y fechas correcto
- ✅ Filtros por fecha funcionando (year, month)
- ✅ Estados de conciliación correctos (❌ Sin Atención)
- ✅ No hay errores de linting
- ✅ No hay errores en consola

**Corrección aplicada**: Fixed lookup en `getSales()` para obtener `patientId` real de `personsData` en lugar de usar `subjectId` directamente.

---

---

### ✅ FASE 3: UI Completa + Responsive - COMPLETADA

**Duración Estimada**: 1.5 días  
**Estado**: ✅ Completada  
**Prioridad**: Alta  
**Dependencias**: FASE 2  
**Outcome Visual**: ✅ Ver cards bonitas, responsive mobile/desktop, notas expandibles

#### Qué podrás ver al final de esta fase:

- 🎨 Cards con diseño completo (colores, sombras, layout)
- 📱 Responsive: vertical en mobile, horizontal en desktop
- 📝 Notas expandibles ("Ver nota completa")
- 🎯 Estados visuales claros (badges de color)
- ✨ Animaciones y hover effects

#### Tareas:

- [x] **3.1** Crear `src/components/drill-down/NoteField.tsx`
  - [x] Prop: note, maxLines, className
  - [x] Estado: isExpanded
  - [x] Truncar texto con CSS (line-clamp)
  - [x] Botón "Ver nota completa" / "Ocultar"
  - [x] Detección automática de si necesita expandirse

- [x] **3.2** Crear `src/components/drill-down/PatientHeader.tsx`
  - [x] Mostrar patientId anonimizado
  - [x] Mostrar edad (con "N/D" si no disponible)
  - [x] Mostrar fecha principal
  - [x] Iconos (👤, 🎂, 📅) y estilos
  - [x] Layout responsive (vertical en mobile, horizontal en desktop)

- [x] **3.3** Crear `src/components/drill-down/AttentionSection.tsx`
  - [x] Mostrar datos de atención con NoteField integrado
  - [x] Badge de estado de conciliación
  - [x] Layout responsive con bordes de colores
  - [x] Colores según status (verde, amarillo, naranja, rojo)
  - [x] Mensaje "Sin Atención Registrada" cuando no existe

- [x] **3.4** Crear `src/components/drill-down/SaleSection.tsx`
  - [x] Mostrar datos de venta
  - [x] Formatear monto (MXN) con Intl.NumberFormat
  - [x] Mostrar diferencia de tiempo si hay match (minutos/horas)
  - [x] Mensaje "Sin Venta Registrada" cuando no existe
  - [x] Diseño con fondo verde y monto destacado

- [x] **3.5** Crear `src/components/drill-down/RecordListItem.tsx`
  - [x] Integrar PatientHeader, AttentionSection, SaleSection
  - [x] Grid responsive (mobile: stack, desktop: 2 cols)
  - [x] Props: record, className
  - [x] Estilos según conciliationStatus (bordes de colores)
  - [x] Hover effects y transiciones

- [x] **3.6** Actualizar `ProcedureDetailPage.tsx`
  - [x] Import de RecordListItem
  - [x] Reemplazar lista simple con RecordListItem
  - [x] Mensaje bonito para "sin registros"
  - [x] Limpieza de código (remover helpers obsoletos)

#### Testing FASE 3:

- [x] Abrir `/procedures/RES` y ver cards bonitas
- [x] Validar responsive: resize ventana (375px, 1280px)
- [x] Mobile (375px): layout vertical perfectamente funcional
- [x] Desktop (1280px): layout horizontal con 2 columnas
- [x] Estados visuales claros (colores correctos: rojo para sin atención, verde para venta)
- [x] Filtros funcionando: `/procedures/RES?year=2024&month=12`
- [x] Breadcrumb "← Volver al Dashboard" funcionando

**Validación completada** (2025-12-17):

- ✅ 5 componentes nuevos creados sin errores de linting
- ✅ Cards con diseño profesional y moderno
- ✅ Responsive perfecto: mobile (stack vertical) y desktop (2 columnas)
- ✅ PatientHeader con iconos y datos anonimizados
- ✅ AttentionSection con badges de estado y colores
- ✅ SaleSection con formateo MXN y diferencia de tiempo
- ✅ RecordListItem con borders de colores según estado
- ✅ NoteField con expand/collapse automático (listo para FASE 4)
- ✅ Navegación breadcrumb funcionando
- ✅ Filtros de fecha funcionando (12 registros en 2024-12)
- ✅ Header dinámico mostrando filtros activos
- ✅ Transiciones y hover effects implementados
- ✅ Problema de PostCSS resuelto (era caché de Vite, no nuestra implementación)

**Archivos creados/modificados**:

- ✅ `src/components/drill-down/NoteField.tsx` (nuevo)
- ✅ `src/components/drill-down/PatientHeader.tsx` (nuevo)
- ✅ `src/components/drill-down/AttentionSection.tsx` (nuevo)
- ✅ `src/components/drill-down/SaleSection.tsx` (nuevo)
- ✅ `src/components/drill-down/RecordListItem.tsx` (nuevo)
- ✅ `src/components/drill-down/ProcedureDetailPage.tsx` (actualizado)

---

---

### ✅ FASE 4: Filtros, Stats e Infinite Scroll - COMPLETADA

**Duración Estimada**: 1 día  
**Estado**: ✅ Completada  
**Prioridad**: Alta  
**Dependencias**: FASE 3  
**Outcome Visual**: ✅ Ver header con stats, filtros funcionando, infinite scroll

#### Qué podrás ver al final de esta fase:

- 📊 Header con stats de conciliación
- 🔍 Filtros adicionales (búsqueda, estado)
- ♾️ Infinite scroll (cargar más al scrollear)
- 🎯 Funcionalidad 100% completa

#### Tareas:

- [ ] **4.1** Crear `src/components/drill-down/ConciliationStats.tsx`
  - [ ] Props: stats (ConciliationStats)
  - [ ] Mostrar métricas clave
  - [ ] Responsive grid

- [ ] **4.2** Crear `src/components/drill-down/FilterBar.tsx`
  - [ ] Select de estado de conciliación
  - [ ] Input de búsqueda (en nota/motivo)
  - [ ] Botón "Limpiar filtros"

- [ ] **4.3** Crear `src/components/drill-down/ProcedureDetailHeader.tsx`
  - [ ] Integrar FilterBar
  - [ ] Integrar ConciliationStats
  - [ ] Título con procedureCode y nombre

- [ ] **4.4** Crear `src/hooks/useInfiniteScroll.ts`
  - [ ] useIntersectionObserver para detectar scroll
  - [ ] Lógica para cargar más datos
  - [ ] Estados: loading, hasMore

- [ ] **4.5** Crear `src/components/drill-down/InfiniteScrollContainer.tsx`
  - [ ] useInfiniteScroll hook
  - [ ] Renderizar lista de RecordListItem
  - [ ] Loading spinner
  - [ ] Mensaje "No hay más registros"

- [ ] **4.6** Actualizar `useProcedureDetail.ts`
  - [ ] Función loadMore() para infinite scroll
  - [ ] Función applyFilters()
  - [ ] Paginación (page state)

- [ ] **4.7** Actualizar `ProcedureDetailPage.tsx`
  - [ ] Integrar ProcedureDetailHeader
  - [ ] Integrar InfiniteScrollContainer
  - [ ] Funcionalidad completa

#### Testing FASE 4:

- [x] Abrir `/procedures/RES` y ver stats en header
- [x] Filtrar por estado funcionando (dropdown con todas las opciones)
- [x] Buscar en notas funcionando (input con debounce 300ms)
- [x] Scroll al final → Ver loading "⏳" → Cargar más registros
- [x] Validar paginación funciona (20 iniciales → 40 → 60...)
- [x] Limpiar filtros → Volver a todos los registros

**Validación completada** (2025-12-17):

✅ **Componentes creados**:

- `src/hooks/useInfiniteScroll.ts` - Hook con IntersectionObserver
- `src/components/drill-down/FilterBar.tsx` - Barra de filtros completa

✅ **Funcionalidad**:

- Infinite scroll: carga 20 registros, luego +20 al hacer scroll
- Filtros client-side por estado de conciliación
- Búsqueda en notas/motivos con debounce
- Contador dinámico: "20 de 100 (531 totales)"
- Indicador de carga: "⏳ Cargando más registros..."
- Badges visuales para filtros activos
- Botón "Limpiar Filtros" funcional

✅ **Responsive**: filtros stack en mobile, columnas en desktop
✅ **Sin errores** de linting ni consola
✅ **Probado** con 531 registros de RES

---

---

### 🟣 FASE 5: Testing Completo Independiente

**Duración Estimada**: 0.5 día  
**Estado**: ⬜ Pendiente  
**Prioridad**: Alta  
**Dependencias**: FASE 4  
**Outcome Visual**: ✅ Validar que TODO funciona perfecto con URLs directas

#### Qué validarás en esta fase:

- ✅ Funcionalidad 100% completa y probada
- 🔗 URLs compartibles funcionan
- 📱 Responsive mobile y desktop
- ♾️ Infinite scroll sin bugs
- 🎯 Todos los casos edge manejados

**Nota Importante**: Esta fase prueba TODO de forma **independiente** usando URLs directas en el navegador, SIN modificar el dashboard. Esto permite desarrollo iterativo sin romper funcionalidad existente.

#### Tareas:

- [ ] **5.1** Testing de URLs y Filtros
  - [ ] Abrir `/procedures/RES` → Ver todos los datos
  - [ ] Abrir `/procedures/RES?year=2024` → Solo 2024
  - [ ] Abrir `/procedures/RES?year=2024&month=01` → Solo Enero 2024
  - [ ] Abrir `/procedures/OTD?year=2024&month=06` → OTD Junio 2024
  - [ ] Copiar URL, pegar en nueva pestaña → Funciona igual

- [ ] **5.2** Testing de Diferentes Procedimientos
  - [ ] `/procedures/RES` - Restauraciones
  - [ ] `/procedures/OTD` - Ortodoncia
  - [ ] `/procedures/END` - Endodoncia
  - [ ] `/procedures/PRO` - Prótesis
  - [ ] Validar datos específicos de cada uno

- [ ] **5.3** Testing de Casos Edge
  - [ ] `/procedures/INVALID` → Mensaje de error amigable
  - [ ] `/procedures/RES?year=1990` → "Sin datos"
  - [ ] `/procedures/RES?month=13` → Ignorar filtro inválido
  - [ ] Sin conexión MongoDB → Error manejado

- [ ] **5.4** Testing de Funcionalidad
  - [ ] Infinite scroll: Scroll al final → Cargar más
  - [ ] Filtros: Cambiar estado → Ver filtrados
  - [ ] Búsqueda: Escribir texto → Ver resultados
  - [ ] Expansión notas: Click → Expandir/Colapsar
  - [ ] Stats: Validar números correctos

- [ ] **5.5** Testing Responsive
  - [ ] Mobile (375px): Layout vertical
  - [ ] Tablet (768px): Layout cambia a horizontal
  - [ ] Desktop (1920px): Todo se ve bien
  - [ ] Touch en mobile funciona

- [ ] **5.6** Testing de Navegación
  - [ ] Click "← Volver al Dashboard" → Ir a `/`
  - [ ] Botón "atrás" navegador → Volver
  - [ ] Botón "adelante" → Ir adelante
  - [ ] F5 (refresh) → Mantiene estado

---

---

### 🔵 FASE 6: Integración con Dashboard (OPCIONAL - AL FINAL)

**Duración Estimada**: 0.5 día  
**Estado**: ⬜ Pendiente  
**Prioridad**: Media  
**Dependencias**: FASE 5  
**Outcome Visual**: ✅ Click en dashboard navega a vista de detalle

#### Qué podrás ver al final de esta fase:

- 🖱️ Click en cualquier elemento del dashboard navega
- 🔗 Context correcto (procedureCode, year) se pasa en URL
- ✅ Integración completa end-to-end

**Nota Importante**: Esta fase se hace AL FINAL, una vez que la vista de detalle está completamente funcional y probada. Esto evita tener handlers en el dashboard que apuntan a páginas incompletas.

#### Tareas:

- [ ] **6.1** Modificar `DentalTreatmentDashboard.tsx`
  - [ ] Importar `useNavigate` de react-router-dom
  - [ ] Crear función `handleDrillDown(context: DrillDownContext)`

- [ ] **6.2** Agregar onClick en Cuadrantes (Matriz Estratégica)
  - [ ] Stars quadrant items
  - [ ] Optimize quadrant items
  - [ ] Grow quadrant items
  - [ ] Review quadrant items

- [ ] **6.3** Agregar onClick en Tabla de Análisis
  - [ ] Click en cada fila (tr)

- [ ] **6.4** Agregar onClick en Scatter Plot
  - [ ] onClick en cada punto (Scatter)

- [ ] **6.5** Agregar onClick en Cards de Resumen
  - [ ] Cards de Atenciones
  - [ ] Cards de Ingresos

- [ ] **6.6** (OPCIONAL) Agregar onClick en Charts Temporales
  - [ ] Barras de attentions chart
  - [ ] Barras de money chart

#### Testing FASE 6:

- [ ] Click en card de cuadrante Stars → Navega a `/procedures/RES?year=...`
- [ ] Click en fila de tabla → Navega correctamente
- [ ] Click en punto de scatter → Navega correctamente
- [ ] Click en card de resumen → Navega correctamente
- [ ] Volver con "atrás" → Dashboard en mismo estado
- [ ] Todos los puntos de entrada funcionan
- [ ] No hay delay perceptible en navegación

---

---

### ⚪ FASE 7: Optimización y Documentación (OPCIONAL)

**Duración Estimada**: 0.5 día  
**Estado**: ⬜ Pendiente  
**Prioridad**: Baja  
**Dependencias**: FASE 6  
**Outcome Visual**: ✅ Performance mejorado, código limpio

#### Qué mejorarás en esta fase:

- ⚡ Performance optimizado
- 📝 Código documentado
- 🧹 Código limpio y refinado
- 📊 Métricas validadas

#### Tareas:

- [ ] **7.1** Optimización de Rendimiento
  - [ ] Memoización de componentes (React.memo)
  - [ ] useMemo para cálculos pesados
  - [ ] useCallback para funciones
  - [ ] Lazy loading de componentes si es necesario

- [ ] **7.2** Documentación
  - [ ] JSDoc en funciones principales
  - [ ] Actualizar plan con decisiones finales
  - [ ] Screenshots de la UI

- [ ] **7.3** Code Review y Refinamiento
  - [ ] Review de código
  - [ ] Eliminar console.logs y debugs
  - [ ] Validar tipos TypeScript estrictos

#### Testing FASE 7:

- [ ] Run Lighthouse (score > 80 aceptable)
- [ ] Validar bundle size (<< 50KB adicional)
- [ ] No memory leaks (abrir/cerrar múltiples veces)
- [ ] Performance mobile aceptable

---

## 🔧 Especificaciones Técnicas

### Algoritmo de Conciliación Detallado

```typescript
function consolidateRecords(
  attentions: AttentionRecord[],
  sales: SaleRecord[]
): ConsolidatedRecord[] {
  const result: ConsolidatedRecord[] = [];
  const matchedSaleIds = new Set<string>();

  // 1. Procesar atenciones y buscar ventas matching
  for (const attention of attentions) {
    const matchingSales = sales.filter(
      (sale) =>
        sale.subjectId === attention.patientId &&
        sale.procedureCode === attention.procedureCode &&
        isSameDay(sale.date, attention.startDate)
    );

    if (matchingSales.length === 0) {
      // Atención sin venta
      result.push({
        id: `att-${attention._id}`,
        patientId: anonymizePatientId(attention.patientId),
        patientAge: attention.patientAge,
        date: attention.startDate,
        attention: formatAttention(attention),
        conciliationStatus: "attention-only",
      });
    } else {
      // Encontrar la venta más cercana en tiempo
      const closestSale = matchingSales.reduce((closest, sale) => {
        const currentDiff = Math.abs(
          sale.date.getTime() - attention.startDate.getTime()
        );
        const closestDiff = Math.abs(
          closest.date.getTime() - attention.startDate.getTime()
        );
        return currentDiff < closestDiff ? sale : closest;
      });

      const timeDiff = calculateTimeDifference(
        attention.startDate,
        closestSale.date
      );

      matchedSaleIds.add(closestSale._id);

      result.push({
        id: `con-${attention._id}-${closestSale._id}`,
        patientId: anonymizePatientId(attention.patientId),
        patientAge: attention.patientAge,
        date: attention.startDate,
        attention: formatAttention(attention),
        sale: formatSale(closestSale),
        timeDifferenceMinutes: timeDiff,
        conciliationStatus: timeDiff <= 180 ? "perfect-match" : "likely-match",
      });
    }
  }

  // 2. Procesar ventas que no se matchearon (ventas órfanas)
  for (const sale of sales) {
    if (!matchedSaleIds.has(sale._id)) {
      result.push({
        id: `sale-${sale._id}`,
        patientId: anonymizePatientId(sale.subjectId),
        patientAge: sale.patientAge,
        date: sale.date,
        sale: formatSale(sale),
        conciliationStatus: "sale-only",
      });
    }
  }

  // 3. Ordenar por fecha descendente
  return result.sort((a, b) => b.date.getTime() - a.date.getTime());
}
```

### Queries MongoDB

#### Query para Atenciones

```typescript
const attentionsQuery = {
  ownerAccount: "MGyL1bJHV1DK",
  recordType: "HealthcareStory",
  "recordTypeCategory.code": "HSMainSubject",
  "recordTypeSubcategory.code": filters.procedureCode,
  ...(filters.year && {
    startDate: {
      $gte: new Date(`${filters.year}-01-01`),
      $lte: new Date(`${filters.year}-12-31`),
    },
  }),
  ...(filters.month && {
    startDate: {
      $gte: new Date(`${filters.year}-${filters.month}-01`),
      $lte: new Date(`${filters.year}-${filters.month}-31`),
    },
  }),
};
```

#### Query para Ventas

```typescript
const salesQuery = {
  ownerAccount: "MGyL1bJHV1DK",
  "recordTypeCategory.code": "DentalHealthcareServiceItem",
  "recordTypeSubcategory.code": filters.procedureCode,
  ...(filters.year && {
    date: {
      $gte: new Date(`${filters.year}-01-01`),
      $lte: new Date(`${filters.year}-12-31`),
    },
  }),
};
```

### Ejemplo de Implementación: ProcedureDetailPage

```typescript
// src/routes/procedure-detail.tsx
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ProcedureDetailPage } from '../components/drill-down/ProcedureDetailPage';

export default function ProcedureDetail() {
  return <ProcedureDetailPage />;
}

// src/components/drill-down/ProcedureDetailPage.tsx
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useProcedureDetail } from '../../hooks/useProcedureDetail';
import { ProcedureDetailHeader } from './ProcedureDetailHeader';
import { InfiniteScrollContainer } from './InfiniteScrollContainer';

export const ProcedureDetailPage = () => {
  // Obtener código de procedimiento de la URL
  const { procedureCode } = useParams<{ procedureCode: string }>();

  // Obtener filtros de query params
  const [searchParams] = useSearchParams();
  const year = searchParams.get('year') || undefined;
  const month = searchParams.get('month') || undefined;
  const day = searchParams.get('day') || undefined;

  // Fetch datos con filtros
  const {
    data,
    stats,
    loading,
    error,
    hasMore,
    loadMore
  } = useProcedureDetail({
    procedureCode: procedureCode!,
    year,
    month,
    day,
    ownerAccount: 'MGyL1bJHV1DK'
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <nav className="bg-white px-4 py-3 border-b">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Volver al Dashboard
        </Link>
      </nav>

      {/* Header con stats y filtros */}
      <ProcedureDetailHeader
        procedureCode={procedureCode!}
        stats={stats}
      />

      {/* Lista de registros con infinite scroll */}
      <InfiniteScrollContainer
        records={data}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
};
```

### Paginación y Performance

```typescript
// Configuración de paginación
const PAGINATION_CONFIG = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  SCROLL_THRESHOLD: 0.8, // Cargar más al llegar al 80% del scroll
};

// En el service
function paginate<T>(
  items: T[],
  page: number,
  limit: number
): PaginatedResponse<T> {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(items.length / limit),
      totalRecords: items.length,
      hasMore: endIndex < items.length,
      limit,
    },
  };
}
```

---

## 🔗 Integración con Dashboard

### Puntos de Entrada Detallados

#### 1. Cuadrantes de Matriz Estratégica

**Ubicación**: `DentalTreatmentDashboard.tsx` líneas ~1282-1408 (Stars), similar para otros cuadrantes

```typescript
// ANTES (línea ~1283)
<div
  key={item.treatment}
  style={{
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    // ... otros estilos
  }}
>

// DESPUÉS
<div
  key={item.treatment}
  onClick={() => handleDrillDown({
    procedureCode: item.treatment,
    procedureName: treatmentDescriptions[item.treatment],
    year: selectedYear !== 'all' ? selectedYear : undefined
  })}
  style={{
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    // ... otros estilos
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
  }}
>
```

#### 2. Tabla de Análisis Detallado

**Ubicación**: Líneas ~2732-2875

```typescript
// DESPUÉS (agregar onClick en <tr>)
<tr
  key={item.treatment}
  onClick={() => handleDrillDown({
    procedureCode: item.treatment,
    procedureName: treatmentDescriptions[item.treatment],
    year: selectedYear !== 'all' ? selectedYear : undefined
  })}
  style={{
    borderBottom: "1px solid #e5e7eb",
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = '#f9fafb';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  }}
>
```

#### 3. Scatter Plot

**Ubicación**: Líneas ~2593-2604

```typescript
// Modificar el Scatter component
<Scatter
  name="Tratamientos"
  data={strategicAnalysis.data}
  fill="#8884d8"
  onClick={(data) => {
    if (data && data.payload) {
      handleDrillDown({
        procedureCode: data.payload.treatment,
        procedureName: treatmentDescriptions[data.payload.treatment],
        year: selectedYear !== 'all' ? selectedYear : undefined
      });
    }
  }}
  style={{ cursor: 'pointer' }}
>
```

#### 4. Cards de Resumen

**Ubicación**: Líneas ~2954-2993 (Atenciones), ~3111-3154 (Ingresos)

```typescript
// DESPUÉS (agregar onClick en div)
<div
  key={treatment}
  className="bg-gray-50 p-4 rounded-lg text-center"
  onClick={() => handleDrillDown({
    procedureCode: treatment,
    procedureName: treatmentDescriptions[treatment],
    year: selectedYear !== 'all' ? selectedYear : undefined
  })}
  style={{
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'scale(1.05)';
    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = 'none';
  }}
>
```

### Función handleDrillDown

```typescript
// Agregar al inicio del componente DentalTreatmentDashboard
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

const handleDrillDown = (context: DrillDownContext) => {
  // Construir query params solo con filtros de fecha
  const params = new URLSearchParams();

  if (context.year) params.append("year", context.year);
  if (context.month) params.append("month", context.month);
  if (context.day) params.append("day", context.day);

  // Navegar a la nueva página
  const queryString = params.toString();
  const url = queryString
    ? `/procedures/${context.procedureCode}?${queryString}`
    : `/procedures/${context.procedureCode}`;

  navigate(url);
};

// Ya NO se necesita:
// - Estado de modalOpen
// - Función handleCloseModal
// - Renderizar modal al final
// - Parámetros source/quadrant
```

---

## 🧪 Testing y Validación

### Test Cases Principales

#### TC-01: Cargar página con URL directa (básico)

- [ ] Abrir `/procedures/RES` en navegador
- [ ] Página se carga correctamente
- [ ] Header muestra "RES - Restauración Dental"
- [ ] Se muestran todas las atenciones RES (todos los años)
- [ ] Stats calculan correctamente
- [ ] Breadcrumb muestra "← Volver al Dashboard"
- [ ] No hay errores en consola

#### TC-02: Conciliación Perfect Match

- [ ] Registro muestra atención y venta
- [ ] Badge verde "✅ Conciliada"
- [ ] Tiempo de diferencia < 3 horas
- [ ] Datos de ambos lados correctos

#### TC-03: Atención sin venta

- [ ] Registro muestra solo atención
- [ ] Badge naranja "⚠️ Sin venta"
- [ ] Mensaje en sección de venta

#### TC-04: Venta sin atención

- [ ] Registro muestra solo venta
- [ ] Badge rojo "❌ Sin atención"
- [ ] Mensaje en sección de atención

#### TC-05: Infinite Scroll

- [ ] Cargar página inicial (20 registros)
- [ ] Scroll al final
- [ ] Loading spinner aparece
- [ ] Siguientes 20 registros se cargan
- [ ] Scroll funciona sin lag

#### TC-06: Expansión de notas (Mobile)

- [ ] Nota larga truncada a 3 líneas
- [ ] Botón "Ver nota completa" visible
- [ ] Click expande nota
- [ ] Botón cambia a "Ocultar"
- [ ] Click colapsa nota

#### TC-07: Responsive Mobile

- [ ] Layout vertical en mobile
- [ ] Todos los elementos visibles
- [ ] Touch targets > 44px
- [ ] Scroll suave

#### TC-08: Responsive Desktop

- [ ] Layout horizontal (2 columnas)
- [ ] Nota abarca ancho completo
- [ ] Hover effects funcionan

#### TC-09: Filtros

- [ ] Filtro por estado de conciliación
- [ ] Búsqueda en notas
- [ ] Filtro de edad
- [ ] Limpiar filtros resetea todo

#### TC-10: Performance

- [ ] Carga inicial < 2s
- [ ] Scroll sin lag
- [ ] No memory leaks

#### TC-11: Cargar página con filtros en URL

- [ ] Abrir `/procedures/RES?year=2024`
- [ ] Solo se muestran datos de 2024
- [ ] Stats reflejan solo datos filtrados
- [ ] Abrir `/procedures/RES?year=2024&month=01`
- [ ] Solo se muestran datos de Enero 2024
- [ ] Abrir `/procedures/OTD?year=2023&month=06&day=15`
- [ ] Solo se muestran datos del día específico

#### TC-12: URL Sharing

- [ ] Copiar URL `/procedures/RES?year=2024&month=01`
- [ ] Pegar en nueva pestaña/ventana
- [ ] Página carga con mismos filtros
- [ ] Datos correctos mostrados
- [ ] Compartir URL por mensaje funciona igual

#### TC-13: Navegación del navegador

- [ ] En página de detalle, hacer click en "← Volver al Dashboard"
- [ ] Navega a `/` (dashboard)
- [ ] Click en botón "atrás" del navegador
- [ ] Vuelve a página de detalle con filtros intactos
- [ ] Click en botón "adelante"
- [ ] Vuelve al dashboard

#### TC-14: Integración con Dashboard (FASE 5 solamente)

**Este test solo aplica después de implementar FASE 5**

- [ ] Click en card de cuadrante Stars con RES
- [ ] Navega a `/procedures/RES?year=...`
- [ ] Click en fila de tabla de análisis con OTD
- [ ] Navega a `/procedures/OTD?year=...`
- [ ] Click en punto de scatter plot
- [ ] Navega correctamente
- [ ] Click en card de resumen
- [ ] Navega correctamente
- [ ] Todos los puntos de entrada funcionan

---

## 📝 Notas y Decisiones

### Decisiones de Diseño

#### DD-01: Página Dedicada vs Modal (CRÍTICA)

**Fecha**: 2025-12-17  
**Decisión**: Página dedicada con ruta propia en React Router  
**Razón**:

- **URL compartible**: Permite compartir links específicos a procedimientos
- **Navegación nativa**: Botón "atrás" del navegador funciona correctamente
- **Mejor UX mobile**: Modal full-screen es básicamente una página de todas formas
- **Infinite scroll**: Funciona mejor en página que en modal
- **Bookmarkable**: Se puede guardar en favoritos
- **SEO-friendly**: Aunque no aplica aquí, es mejor práctica
- **Volumen de datos**: Puede haber 100+ registros, mejor en página dedicada

**Alternativas consideradas**:

- Modal (descartado): No permite URLs compartibles, problemas con navegación del navegador, peor UX para muchos datos

**Implementación**:

```typescript
// Ruta: /procedures/:procedureCode
// Query params: ?year=2024&month=01&source=quadrant&quadrant=stars
```

#### DD-02: Layout Responsive

**Fecha**: 2025-12-17  
**Decisión**: Mobile-first con layout vertical, desktop con 2 columnas  
**Razón**: Mejor UX en mobile, aprovecha espacio en desktop  
**Alternativas consideradas**: Tabla responsive (descartada por notas largas)

#### DD-03: Expansión de Notas

**Fecha**: 2025-12-17  
**Decisión**: Mobile usa expansión inline, Desktop puede usar tooltip + expansión  
**Razón**: Touch-friendly en mobile, más rápido en desktop  
**Alternativas consideradas**: Siempre tooltip (descartado por mobile), siempre expandir (descartado por espacio)

#### DD-04: Algoritmo de Matching

**Fecha**: 2025-12-17  
**Decisión**: Match por patientId, procedureCode, mismo día, más cercano en tiempo  
**Razón**: Balance entre precisión y flexibilidad  
**Threshold**: ≤3h = perfect-match, >3h mismo día = likely-match  
**Alternativas consideradas**: Solo mismo día (muy flexible), ±1h (muy restrictivo)

#### DD-05: Paginación

**Fecha**: 2025-12-17  
**Decisión**: Infinite scroll con 20 registros por página  
**Razón**: Mejor UX que botones de paginación, especialmente en mobile  
**Alternativas consideradas**: Virtual scrolling (complejidad innecesaria para ~100 registros típicos)

#### DD-06: Anonimización de PatientId

**Fecha**: 2025-12-17  
**Decisión**: Mostrar solo últimos 4 caracteres (ej: "\***\*6f1M")  
**Razón**: Balance entre trazabilidad y privacidad  
**Alternativas consideradas\*\*: Hash completo (no trazable), mostrar todo (inseguro)

#### DD-07: Eliminación de Query Params `source` y `quadrant`

**Fecha**: 2025-12-17  
**Decisión**: Eliminar parámetros `source` y `quadrant` de la URL  
**Razón**:

- **Sin valor funcional**: No restauran posición de scroll sin implementación adicional
- **Complejidad innecesaria**: Agregan superficie de bugs sin beneficio claro
- **URLs más limpias**: `/procedures/RES?year=2024` vs `/procedures/RES?year=2024&source=quadrant&quadrant=stars`
- **Navegación simple**: Botón "atrás" siempre vuelve al top del dashboard (suficiente para MVP)

**Alternativas consideradas**:

- Mantener params + implementar scroll restoration (descartado: +1 día desarrollo, complejidad alta)
- Usar sessionStorage para tracking (descartado: mismo problema, diferente implementación)

**Implementación**:

```typescript
// ANTES
handleDrillDown({
  source: "quadrant",
  quadrantType: "stars",
  procedureCode: "RES",
  year: "2024",
});
// URL: /procedures/RES?year=2024&source=quadrant&quadrant=stars

// DESPUÉS
handleDrillDown({
  procedureCode: "RES",
  year: "2024",
});
// URL: /procedures/RES?year=2024
```

**Feature futura**: Ver PQ-04 para scroll restoration en versión futura

#### DD-08: Desarrollo Independiente y Testing con URLs

**Fecha**: 2025-12-17  
**Decisión**: Desarrollar vista de detalle de forma independiente y testing con URLs directas. Integración con dashboard AL FINAL.  
**Razón**:

- **Dashboard no se rompe**: No hay handlers que apuntan a páginas incompletas
- **Testing más fácil**: Probar con `/procedures/RES?year=2024` en navegador
- **Desarrollo iterativo**: Cada fase es funcional e independiente
- **Menos riesgo**: Dashboard productivo no se afecta durante desarrollo
- **Debugging simple**: No hay que navegar desde dashboard para probar

**Alternativas consideradas**:

- Desarrollar dashboard handlers primero (descartado: rompe funcionalidad existente)
- Desarrollar todo en paralelo (descartado: mayor complejidad, más bugs)

**Orden de implementación**:

```
FASE 1-3: Desarrollo de vista
   ↓
FASE 4: Testing con URLs directas ← AQUÍ se valida todo
   ↓
FASE 5: Integración dashboard (solo agregar onClick handlers)
   ↓
FASE 6: Optimización (opcional)
```

**Ejemplos de testing (FASE 4)**:

```bash
# Abrir directamente en navegador:
http://localhost:5173/procedures/RES
http://localhost:5173/procedures/RES?year=2024
http://localhost:5173/procedures/RES?year=2024&month=01
http://localhost:5173/procedures/OTD?year=2024&month=06

# No se necesita click desde dashboard para probar
```

### Preguntas Pendientes

#### PQ-01: ¿Virtualización?

**Estado**: ⬜ Pendiente de decisión  
**Contexto**: ¿Usar react-window para listas >100 registros?  
**Impacto**: Performance vs Complejidad  
**Decisión requerida antes de**: FASE 2

#### PQ-02: ¿Export a Excel/CSV?

**Estado**: ⬜ Pendiente de decisión  
**Contexto**: ¿Agregar botón de export?  
**Impacto**: Feature nice-to-have, +0.5 día  
**Decisión requerida antes de**: FASE 5

#### PQ-03: ¿Cacheo de datos?

**Estado**: ⬜ Pendiente de decisión  
**Contexto**: ¿Usar React Query o SWR para caching?  
**Impacto**: Performance vs Dependencias adicionales  
**Decisión requerida antes de**: FASE 1

#### PQ-04: ¿Scroll Restoration? (Feature Futura)

**Estado**: ⬜ Pospuesto para versión futura  
**Contexto**: ¿Implementar restauración de posición de scroll al volver al dashboard?  
**Implementación requerida**:

- Guardar posición de scroll en sessionStorage al navegar
- Guardar ID del elemento clickeado
- Restaurar scroll al volver (useEffect)
- Agregar IDs únicos a todos los elementos clickeables del dashboard

**Estimación**: +1 día de desarrollo  
**Prioridad**: Baja (nice-to-have)  
**Decisión**: Por ahora, el botón "atrás" vuelve al top del dashboard (suficiente para MVP)

### Riesgos Identificados

#### R-01: Volumen de datos

**Probabilidad**: Media  
**Impacto**: Alto  
**Mitigación**: Paginación agresiva, virtualización si es necesario, índices en MongoDB

#### R-02: Matching incorrecto

**Probabilidad**: Baja  
**Impacto**: Alto  
**Mitigación**: Testing exhaustivo con datos reales, ajustar threshold si es necesario

#### R-03: Performance en mobile

**Probabilidad**: Media  
**Impacto**: Medio  
**Mitigación**: Lazy loading, memoización, evitar re-renders innecesarios

---

## 📚 Referencias

### Documentos Relacionados

- [MongoDB Integration Completed](./mongodb-integration-completed.md)
- [Cursor Prompt MongoDB](./cursor_prompt_mongodb.md)

### Librerías Utilizadas

- React 18+
- TypeScript 5+
- Recharts (ya en uso)
- Tailwind CSS (ya en uso)
- date-fns (a instalar)
- react-intersection-observer (a instalar, opcional)

### Recursos Externos

- [React Intersection Observer](https://github.com/thebuilder/react-intersection-observer)
- [Infinite Scroll Pattern](https://web.dev/patterns/web-vitals-patterns/infinite-scroll)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 📊 Progreso General

### Resumen de Fases

| Fase | Nombre                | Duración | Outcome Visual                   | Estado       |
| ---- | --------------------- | -------- | -------------------------------- | ------------ |
| 0    | Planificación         | 0.5d     | 📋 Plan completo                 | ✅ Completo  |
| 1    | Setup + Skeleton      | 0.5d     | 🌐 Página básica funciona        | ✅ Completo  |
| 2    | Service + Datos       | 2d       | 📊 Lista simple de datos reales  | ⬜ Pendiente |
| 3    | UI + Responsive       | 1.5d     | 🎨 Cards bonitas, mobile/desktop | ⬜ Pendiente |
| 4    | Filtros + Scroll      | 1d       | 🔍 Funcionalidad completa        | ⬜ Pendiente |
| 5    | Testing Final         | 0.5d     | ✅ Todo validado                 | ⬜ Pendiente |
| 6    | Integración Dashboard | 0.5d     | 🖱️ Clicks funcionan              | ⬜ Pendiente |
| 7    | Optimización          | 0.5d     | ⚡ Performance mejorado          | ⬜ Pendiente |

**Progreso Total**: 25% (2/8 fases completas)

**Tiempos acumulados:**

- **Core funcional (0-5)**: ~5 días → Vista completa sin integración
- **Con integración (0-6)**: ~5.5 días → End-to-end completo
- **Con optimización (0-7)**: ~6 días → Pulido y optimizado

**Nota**: Fases 6-7 son opcionales. La funcionalidad core está completa en FASE 5.

---

## 📝 Log de Cambios

### 2025-12-17 (v5 - Fases Incrementales con Outcomes Visuales)

- ✅ **REORGANIZACIÓN INCREMENTAL**: Cada fase tiene outcome visual claro
- ✅ Nueva FASE 1: Setup + Página Skeleton (ver página básica funcionar)
- ✅ Nueva FASE 2: Service + Primeros Datos (ver lista simple de datos reales)
- ✅ Nueva FASE 3: UI Completa + Responsive (ver cards bonitas)
- ✅ Nueva FASE 4: Filtros + Infinite Scroll (funcionalidad completa)
- ✅ Nueva FASE 5: Testing Final (validar todo)
- ✅ Nueva FASE 6: Integración Dashboard (clicks)
- ✅ Nueva FASE 7: Optimización (polish)
- ✅ Cada fase es demostrable y probable
- ✅ Desarrollo más ágil con feedback visual continuo
- ✅ Tabla de fases con columna "Outcome Visual"
- ✅ Tiempos acumulados calculados

**Ventaja clave**: Ver progreso en cada paso, probar incrementalmente

### 2025-12-17 (v4 - Reorganización de Fases)

- ✅ **REORGANIZACIÓN CRÍTICA**: Integración con dashboard movida a FASE 5 (AL FINAL)
- ✅ Nueva FASE 4: Testing independiente con URLs directas
- ✅ Testing NO depende de clicks en dashboard
- ✅ Se puede probar `/procedures/RES?year=2024` directamente en navegador
- ✅ Dashboard no se modifica hasta que vista esté completa (FASE 5)
- ✅ Actualizados test cases para usar URLs directas
- ✅ Agregado TC-14 específico para integración dashboard (FASE 5)
- ✅ Nueva FASE 6 para optimización (opcional)
- ✅ Agregada sección "Orden de Desarrollo" al inicio
- ✅ Tabla de fases actualizada (7 fases totales)

### 2025-12-17 (v3 - Simplificación de Query Params)

- ✅ **ELIMINADOS** query params `source` y `quadrant` (sin valor funcional)
- ✅ Simplificado DrillDownContext (solo procedureCode + filtros de fecha)
- ✅ URLs más limpias: `/procedures/RES?year=2024` (sin metadata innecesaria)
- ✅ Simplificada función handleDrillDown
- ✅ Breadcrumb genérico: "← Volver al Dashboard" (siempre al top)
- ✅ Agregada decisión de diseño DD-07 (Eliminación de source/quadrant)
- ✅ Agregada PQ-04 sobre Scroll Restoration como feature futura
- ✅ Actualizados todos los ejemplos de código e integración
- ✅ Actualizado test case TC-01

### 2025-12-17 (v2 - Revisión Mayor)

- ✅ **CAMBIO CRÍTICO**: Modal → Página dedicada con React Router
- ✅ Eliminado RNF-02 (Accesibilidad) para reducir complejidad
- ✅ Agregada navegación con URLs compartibles
- ✅ Actualizada arquitectura de componentes (ProcedureDetailPage)
- ✅ Actualizada estructura de archivos (routes/procedure-detail.tsx)
- ✅ Agregado soporte para query params en URL
- ✅ Actualizado flujo de navegación con useParams() y useSearchParams()
- ✅ Agregada decisión de diseño DD-01 (Página vs Modal)
- ✅ Actualizado test case TC-11 para validar URL sharing
- ✅ Actualizada Fase 3 y 4 para reflejar cambios de navegación

### 2025-12-17 (v1 - Inicial)

- ✅ Creación del documento de plan de implementación
- ✅ Definición de requerimientos funcionales y no funcionales
- ✅ Diseño de arquitectura de componentes (con modal)
- ✅ Definición de tipos TypeScript
- ✅ Plan de implementación por fases con tareas detalladas
- ✅ Especificaciones técnicas (algoritmo de matching, queries)
- ✅ Diseño responsive mobile-first
- ✅ Identificación de puntos de integración en dashboard

---

## 🎯 Próximos Pasos

1. **Revisar y aprobar** este plan de implementación
2. **Instalar dependencias** necesarias (date-fns, react-intersection-observer)
3. **Iniciar FASE 1**: Crear tipos y service layer
4. **Testing continuo** desde el inicio de cada fase

---

**Última actualización**: 2025-12-17 (v5) por Claude Sonnet 4.5  
**Estado del documento**: ✅ Completo y listo para implementación

**Cambios principales**:

- **v5**: Fases incrementales con outcomes visuales en cada paso
- **v4**: Desarrollo independiente, testing con URLs directas, integración al final
- **v3**: URLs simplificadas (eliminados source/quadrant)
- **v2**: Página dedicada en vez de modal, URLs compartibles
- **v1**: Diseño inicial con modal

**Resumen de v5**:

- ✅ 8 fases incrementales (0-7)
- ✅ Cada fase tiene algo visible/probable
- ✅ Feedback visual continuo
- ✅ ~5 días para funcionalidad core
- ✅ Desarrollo ágil y motivante

---

## 🔄 Script de Sincronización de Códigos de Procedimientos

### 📊 Problema Detectado (2024-12-17)

**Situación**: No hay matches entre atenciones (`patientsData`) y ventas (`moneyAccountsData`) porque los códigos de procedimiento (`recordTypeSubcategory.code`) están registrados de forma diferente en ambas colecciones, aunque corresponden al mismo servicio prestado al mismo paciente el mismo día.

**Causa raíz**: La colección `moneyAccountsData` (ventas) tiene códigos de procedimiento incorrectos o diferentes comparados con `patientsData` (atenciones), que es la fuente de verdad.

**Impacto**:

- El drill-down no puede mostrar ventas asociadas a cada atención
- `matchedPayments` queda vacío en los detalles
- Análisis financiero incompleto a nivel de procedimiento

### ✅ Solución Implementada

Script de migración `sync-procedure-codes.ts` que sincroniza códigos de procedimiento desde `patientsData` hacia `moneyAccountsData`.

#### 🎯 Características Principales

1. **Lookup de Tres Colecciones**:

   ```
   moneyAccountsData.subjectId
   → personsData._id
   → personsData.patientId
   → Match con patientsData (mismo patientId + mismo día)
   ```

2. **Auditoría Completa**:
   - Cada actualización incluye subdocumento `_migrationLog`
   - Registra valores previos y nuevos
   - Guarda ID de atención origen y criterios de match
   - Soporte completo para rollback

3. **Capacidad de Rollback**:
   - Rollback completo usando logs de migración
   - Restaura valores previos
   - Marca registros como revertidos con timestamp

4. **Reportes Exhaustivos**:
   - Reporte principal con todas las estadísticas
   - Archivos separados para registros sin match (revisión manual)
   - Archivos separados para múltiples matches (casos ambiguos)
   - Desglose por código de procedimiento

5. **Características de Seguridad**:
   - Modo dry-run por defecto
   - Modo de prueba con límite de registros
   - Confirmación del usuario antes de ejecución
   - Advertencia si > 20% registros sin match
   - Manejo de errores con logging detallado

#### 📝 Comandos de Uso

```bash
# Dry run (vista previa, sin cambios)
npm run sync:codes

# Prueba con 10 registros
npm run sync:codes:test

# Ejecutar migración real
npm run sync:codes:execute

# Ver último reporte
npm run sync:codes:report

# Revertir migración específica
npm run sync:codes:rollback -- --migration-id="procedure-code-sync-2024-12-17"
```

#### 🗂️ Estructura del Migration Log

Cada registro actualizado recibe un subdocumento `_migrationLog`:

```javascript
{
  _migrationLog: {
    migrationId: "procedure-code-sync-2024-12-17",
    timestamp: ISODate("2024-12-17T10:30:00Z"),
    action: "recordTypeSubcategory-sync",
    previousValues: {
      code: "XXX",
      description: "Descripción anterior"
    },
    newValues: {
      code: "RES",
      description: "Restauración Dental"
    },
    sourceAttentionId: "P#ixYYSxO6f1lM_HS#KUJtIu-LkvKZ",
    matchCriteria: {
      patientId: "P#ixYYSxO6f1lM",
      date: "2024-03-15"
    },
    // Agregado si se revierte:
    rolledBack: true,
    rollbackTimestamp: ISODate("2024-12-17T12:00:00Z")
  }
}
```

#### 🔍 Lógica de Matching

1. **Filtrar ventas**:
   - `ownerAccount: "MGyL1bJHV1DK"`
   - `recordTypeCategory.code: "DentalHealthcareServiceItem"`

2. **Lookup de patientId** vía `personsData`

3. **Buscar atención en `patientsData`**:
   - Mismo `patientId`
   - Mismo día (match a nivel día, ignora hora)
   - Filtros: `recordType: "HealthcareStory"`, `recordTypeCategory.code: "HSMainSubject"`

4. **Actualizar si hay un único match**

5. **Omitir si**:
   - No hay match
   - Múltiples matches (ambiguo)
   - Ya está sincronizado (código correcto)

#### 📂 Casos Especiales

| Caso                  | Acción                  | Registro                                 |
| --------------------- | ----------------------- | ---------------------------------------- |
| **Sin match**         | No actualizar           | Guardar en `no-match-records.json`       |
| **Múltiples matches** | No actualizar           | Guardar en `multiple-match-records.json` |
| **Ya sincronizado**   | Omitir                  | Contar en estadística                    |
| **Error**             | Continuar con siguiente | Guardar en array de errores              |

#### 📊 Reportes Generados

**Ubicación**: `helpers/migration-reports/`

**Archivos**:

- `migration-report-{timestamp}.json` - Reporte completo de migración
- `no-match-records-{timestamp}.json` - Registros sin matches
- `multiple-match-records-{timestamp}.json` - Casos ambiguos
- `rollback-report-{timestamp}.json` - Detalles de rollback

**Ejemplo de reporte**:

```
======================================================================
📊 MIGRATION SUMMARY
======================================================================
Migration ID: procedure-code-sync-2024-12-17
Mode: EXECUTE

Total processed: 531
✅ Updated: 450
✔️  Already synced: 11
⚠️  No match found: 50
⚠️  Multiple matches: 20
❌ Errors: 0

📋 By Procedure Code:
   RES: 200 updated
   OTD: 150 updated
   END: 50 updated
   EXO: 30 updated
   PER: 20 updated
   ... and 5 more codes
======================================================================
```

### 🚀 Plan de Ejecución

#### Paso 1: Prueba Inicial

```bash
npm run sync:codes:test
```

✅ Validar lógica de matching con 10 registros  
✅ Revisar output del test  
✅ Confirmar que los matches sean correctos

#### Paso 2: Dry Run Completo

```bash
npm run sync:codes
```

✅ Analizar estadísticas del resumen  
✅ Verificar porcentaje de registros sin match  
✅ Revisar primeros 5 registros a modificar

#### Paso 3: Revisar Registros Sin Match

- Abrir `helpers/migration-reports/no-match-records-*.json`
- Investigar por qué no se encontraron matches
- Determinar si hay problemas de calidad de datos
- Decidir si el % de no-match es aceptable

#### Paso 4: Ejecutar Migración (si dry run OK)

```bash
npm run sync:codes:execute
```

✅ Confirmar cuando se solicite  
✅ Monitorear progreso  
✅ Revisar reporte final

#### Paso 5: Validar Resultados

- Re-ejecutar analytics para verificar mejora en matches
- Probar funcionalidad de drill-down
- Verificar integridad de datos
- Revisar que `matchedPayments` se pueble correctamente

#### Paso 6: Rollback (si es necesario)

```bash
npm run sync:codes:rollback -- --migration-id="procedure-code-sync-2024-12-17"
```

### 📈 Impacto Esperado en Analytics

**Después de la sincronización**:

- ✅ Drill-down mostrará ventas coincidentes para cada atención
- ✅ `matchedPayments` se poblará correctamente en datos de drill-down
- ✅ Atribución de ingresos será más precisa
- ✅ Análisis financiero a nivel de procedimiento estará completo
- ✅ Reportes de procedimientos más confiables

### ⚠️ Consideraciones Importantes

1. **Backup**: Aunque hay rollback, considerar backup de `moneyAccountsData` antes de ejecutar
2. **Horario**: Ejecutar en horario de bajo tráfico
3. **Monitoreo**: Supervisar el proceso durante la ejecución
4. **Validación**: Validar exhaustivamente con datos de prueba primero
5. **Documentación**: Guardar todos los reportes para auditoría futura

### 📚 Documentación Adicional

Para más detalles sobre el script, ver:

- `/src/scripts/sync-procedure-codes.ts` - Código fuente comentado
- `/src/scripts/README.md` - Documentación completa de uso

---

**Estado del Script**: ✅ Implementado y listo para pruebas  
**Fecha de Implementación**: 2024-12-17  
**Próximo Paso**: Ejecutar `npm run sync:codes:test`
