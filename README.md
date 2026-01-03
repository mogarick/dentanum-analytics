# Dentanum Analytics

A React-based analytics dashboard for dental treatment data visualization and reconciliation, built with React Router v7, Vite, and MongoDB.

## 🚧 Estado del Proyecto

- ✅ **Dashboard Principal**: Completado y funcional
- 🟡 **Drill-Down de Procedimientos**: Funcional pero pendiente de integración completa (FASE 6)
  - ✅ FASE 5 completada: Testing y validación
  - 🟡 FASE 6 pendiente: Integración con dashboard (clicks desde gráficos)

> **Nota**: El drill-down es completamente funcional accediendo directamente a `/procedures/:code`, pero aún no está integrado con los clicks del dashboard principal.

## Features

### 📊 Dashboard Principal (✅ Completo)
- Interactive charts and visualizations using Recharts
- Multiple chart types (Line, Area, Bar)
- Treatment filtering and year-based filtering
- Real-time data processing from MongoDB
- Responsive design with Tailwind CSS
- TypeScript support

### 🔍 Drill-Down de Procedimientos (🟡 Funcional - Pendiente Integración)
- ✅ Vista detallada por código de procedimiento (RES, END, OTD, etc.)
- ✅ **Conciliación automática** de atenciones vs ventas
- ✅ Ventana de tiempo inteligente (-24h a +72h)
- ✅ Agrupación por fecha con sticky headers
- ✅ Filtrado por estado de conciliación
- ✅ Infinite scroll para grandes volúmenes de datos
- ✅ Tasa de conciliación en tiempo real (45.7%)
- 🟡 **Pendiente**: Navegación desde dashboard (clicks en gráficos)

### 🎯 Estados de Conciliación
- ✅ **Match Perfecto**: Atención y venta en ≤3 horas
- 🟡 **Match Probable**: Atención y venta en >3h, ≤72h
- ⚠️ **Sin Venta**: Atención sin venta asociada
- ❌ **Sin Atención**: Venta sin atención registrada

## Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router v7** - Routing and data loading
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Recharts** - Chart library
- **Tailwind CSS** - Styling

### Backend
- **MongoDB** - Database (via MongoDB MCP)
- **Node.js** - Server-side runtime
- **React Router Server** - SSR and data fetching

### Development
- **Bun** - Package manager
- **ESLint** - Code linting
- **Chrome DevTools MCP** - Testing automation

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system
- MongoDB connection (configured via MCP or connection string)
- Node.js 18+ (for React Router server)

### Installation

1. Install dependencies:

```bash
bun install
```

2. Configure MongoDB connection (if needed):
   - Via MCP: Configure in Cursor settings
   - Via env: Set `MONGODB_URI` environment variable

### Development

Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

## Project Structure

```
dentanum-analytics/
├── src/
│   ├── routes/                      # React Router routes
│   │   ├── home.tsx                 # Dashboard principal
│   │   └── procedure-detail.tsx     # Drill-down de procedimientos
│   ├── components/
│   │   ├── drill-down/              # Componentes de drill-down
│   │   │   ├── ProcedureDetailPage.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── RecordListItem.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── services/
│   │   ├── procedureDetailService.server.ts  # Lógica de conciliación
│   │   └── ...
│   ├── types/
│   │   └── procedureDetail.types.ts          # TypeScript types
│   ├── utils/
│   │   ├── dateUtils.ts                      # Utilidades de fecha
│   │   └── treatmentCatalog.ts               # Catálogo de tratamientos
│   └── app.css                               # Estilos globales
├── documentation/                   # Documentación del proyecto
│   ├── procedure-drill-down-implementation-plan.md
│   ├── phase5-testing-results.md
│   ├── time-window-improvement.md
│   ├── sticky-date-headers-improvement.md
│   └── future-features/
│       └── advanced-search-spec.md
├── helpers/                         # Scripts y helpers
│   └── FINAL-STATUS.md
├── index.html
├── package.json
├── vite.config.ts
├── react-router.config.ts           # React Router configuration
├── tsconfig.json
└── README.md
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint

## Data Structure

The dashboard processes dental treatment data with the following structure:

```typescript
interface TreatmentData {
  _id: {
    yearMonth: string; // Format: "YYYY-MM"
    treatmentCode: string; // Treatment code (e.g., "RES", "ODG")
    treatmentDescription: string; // Full treatment description
  };
  count: number; // Number of treatments
}
```

## Chart Types

1. **Line Chart** - Best for showing trends over time
2. **Area Chart** - Best for showing proportions and cumulative data
3. **Bar Chart** - Best for comparing specific values

## Treatment Codes

The dashboard supports various dental treatment codes:

- RES: Restauración Dental
- ODG: Odontología General
- OTD: Ortodoncia
- PRO: Prótesis Dental
- EXO: Exodoncia
- END: Endodoncia
- And many more...

## Key Features Implementation

### Conciliación de Registros

El sistema implementa un algoritmo inteligente de conciliación que:

1. **Busca matches en ventana de tiempo**: -24h a +72h desde la atención
2. **Clasifica por precisión**:
   - Perfect Match: ≤3 horas de diferencia
   - Likely Match: >3h, ≤72h de diferencia
3. **Evita duplicados**: Cada venta se asocia solo una vez
4. **Calcula métricas**: Tasa de conciliación, totales, etc.

### Sticky Date Headers

Los registros se agrupan por fecha con headers que:
- Se mantienen fijos durante el scroll
- Muestran el conteo de registros por día
- Formato inteligente: "Hoy", "Ayer", o fecha completa

### Filtros y Navegación

- Filtro por estado de conciliación
- Filtros de fecha en URL (year, month, day)
- Infinite scroll para grandes volúmenes
- Breadcrumbs para navegación

## Documentación

Documentación detallada disponible en `/documentation`:

- **Plan de Implementación**: `procedure-drill-down-implementation-plan.md`
- **Resultados de Testing**: `phase5-testing-results.md`
- **Mejoras Implementadas**:
  - `time-window-improvement.md`
  - `sticky-date-headers-improvement.md`
- **Features Futuros**: `future-features/advanced-search-spec.md`

## 📈 Roadmap y Estado

### Completado
- ✅ **Dashboard Principal**: 100% funcional
- ✅ **FASE 0-5 Drill-Down**: Planificación, desarrollo, UI, testing
- ✅ **Mejoras de UX**: Sticky headers + ventana de tiempo
- ✅ **Bug crítico corregido**: Tasa de conciliación 0% → 45.7%

### En Desarrollo
- 🟡 **FASE 6**: Integración dashboard ← drill-down (pendiente)
  - Hacer clickeables las barras/áreas del dashboard
  - Navegar a `/procedures/:code` con filtros de fecha
  - Mantener contexto de navegación

### Futuro
- 📋 **Búsqueda avanzada**: MongoDB Text Search (spec completo)
- 📋 **FASE 7**: Optimización (opcional)

> **Estado Actual**: El drill-down está completamente funcional y testeado, pero requiere navegación manual a `/procedures/:code`. La integración con clicks del dashboard (FASE 6) está pendiente.

Ver `documentation/PROJECT-STATUS.md` y `documentation/procedure-drill-down-implementation-plan.md` para detalles completos.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (ver `documentation/phase5-testing-results.md`)
5. Submit a pull request

## License

This project is part of the Dentanum ecosystem.






