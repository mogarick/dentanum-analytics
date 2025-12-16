# Prompt para Cursor: Migrar Dashboard de Datos Estáticos a MongoDB Dinámico

## Contexto

Tengo el componente@App.tsx que actualmente usa datos estáticos hardcodeados. Necesito convertirlo para que consuma datos dinámicamente desde MongoDB usando agregaciones.

## Objetivo

Crear un sistema de extracción de datos desde MongoDB que alimente el dashboard de tratamientos dentales, reemplazando el array `rawData` estático por datos obtenidos de la base de datos `sakdental`, colección `patientsData`.

## Estructura de Datos en MongoDB

### Colección: `patientsData`

```typescript
interface PatientData {
  _id: string;
  recordType: string;
  startDate: Date;
  endDate?: Date | null;
  name: string;
  createdAt: Date;
  ownerAccount: string;
  recordTypeCategory?: {
    code: string;
  };
  recordTypeSubcategory?: {
    code: string;
    description: string;
  };
}
```

## Query MongoDB Principal

```javascript
db.patientsData.aggregate([
  {
    $match: {
      startDate: { $ne: null },
      recordTypeSubcategory: { $ne: null },
    },
  },
  {
    $addFields: {
      year: { $year: "$startDate" },
      month: { $month: "$startDate" },
      yearMonth: {
        $dateToString: {
          date: "$startDate",
          format: "%Y-%m",
        },
      },
    },
  },
  {
    $group: {
      _id: {
        yearMonth: "$yearMonth",
        year: "$year",
        month: "$month",
        treatmentCode: "$recordTypeSubcategory.code",
        treatmentDescription: "$recordTypeSubcategory.description",
      },
      count: { $sum: 1 },
    },
  },
  {
    $sort: {
      "_id.yearMonth": 1,
      "_id.treatmentCode": 1,
    },
  },
]);
```

## Tareas a Realizar

### 1. Crear Service Layer para MongoDB

Crea un archivo `src/services/treatmentDataService.ts` con:

```typescript
// Estructura de tipos esperada
interface TreatmentDataResponse {
  _id: {
    yearMonth: string;
    year: number;
    month: number;
    treatmentCode: string;
    treatmentDescription: string;
  };
  count: number;
}

// Formato esperado por el componente (compatible con rawData actual)
interface TreatmentData {
  _id: {
    yearMonth: string;
    treatmentCode: string;
  };
  count: number;
}

// Función principal que debe:
// 1. Conectar a MongoDB (sakdental database)
// 2. Ejecutar la agregación
// 3. Transformar el resultado al formato esperado por el componente
// 4. Manejar errores apropiadamente
// 5. Cerrar la conexión
async function getTreatmentDataByMonth(): Promise<TreatmentData[]>;
```

**Requerimientos:**

- Usar TypeScript estricto
- Incluir manejo de errores robusto (try-catch-finally)
- La función debe transformar el resultado de MongoDB al formato exacto que usa el componente actualmente
- Agregar logging para debugging
- Implementar connection pooling si es posible

### 2. Crear Hook React Personalizado

Crea `src/hooks/useTreatmentData.ts`:

```typescript
interface UseTreatmentDataReturn {
  data: TreatmentData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Hook que debe:
// 1. Cargar datos al montar el componente
// 2. Manejar estados de loading y error
// 3. Permitir refetch manual
// 4. Usar React Query o SWR si está disponible, o implementar con useState/useEffect
function useTreatmentData(): UseTreatmentDataReturn;
```

### 3. Actualizar el Componente Principal

Modificar `DentalTreatmentDashboard.tsx`:

**Cambios necesarios:**

1. Reemplazar el array `rawData` hardcodeado por el hook `useTreatmentData()`
2. Agregar UI de loading state (skeleton o spinner)
3. Agregar UI de error state con botón de retry
4. Agregar botón de refresh/reload para refetch manual
5. Mantener TODA la lógica de visualización existente sin cambios

**Ejemplo de integración:**

```typescript
const DentalTreatmentDashboard = () => {
  const { data: rawData, loading, error, refetch } = useTreatmentData();

  // Agregar loading state
  if (loading) {
    return <LoadingSpinner />; // Crear componente simple
  }

  // Agregar error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />; // Crear componente
  }

  // El resto del código permanece EXACTAMENTE igual
  // ...
};
```

### 4. Configuración de Variables de Entorno

Crear o actualizar `.env.local` con los datos de conexión del MongoDB MCP server configurado en Cursor:

```
MONGODB_URI=<obtener de connectiomn string de MongoDB MCP server>
MONGODB_DATABASE=sakdental
MONGODB_COLLECTION=patientsData
```

OJO: Asegúrate de contemplar esto para el deploy en netlify.

### 5. Agregar Dependencias

Si no están instaladas, agregar:

```bash
npm install mongodb
# O si prefieres usar un ORM:
# npm install mongoose
```

## Consideraciones Importantes

### Performance

- Implementar caché en memoria con tiempo de expiración (ej: 5 minutos)
- Considerar usar React Query para caché automático
- La query de agregación ya está optimizada

### Índices Recomendados en MongoDB

IMPORTANTE: Revisa primero si existen +indices antes de crear nuevos.

```javascript
db.patientsData.createIndex({ startDate: 1 });
db.patientsData.createIndex({ "recordTypeSubcategory.code": 1 });
db.patientsData.createIndex({ startDate: 1, "recordTypeSubcategory.code": 1 });
```

### Manejo de Errores

- Network errors: Mostrar mensaje user-friendly
- Timeout errors: Implementar retry con backoff
- Data validation: Validar estructura de respuesta antes de usarla

### Testing (Opcional pero Recomendado)

- Crear mock data para tests unitarios
- Testear transformación de datos MongoDB → Componente
- Testear estados de loading y error

## Estructura de Archivos Esperada

```
src/
├── components/
│   └── DentalTreatmentDashboard.tsx (modificar)
├── services/
│   └── treatmentDataService.ts (crear)
├── hooks/
│   └── useTreatmentData.ts (crear)
├── types/
│   └── treatmentData.types.ts (crear - opcional)
└── utils/
    └── mongodb.ts (crear - helper de conexión)
```

## Validación del Resultado

El componente debe:

1. ✅ Cargar datos automáticamente al montar
2. ✅ Mostrar loading spinner durante carga
3. ✅ Mostrar error con opción de retry si falla
4. ✅ Renderizar gráfica exactamente igual que antes cuando los datos cargan
5. ✅ Permitir refrescar datos manualmente
6. ✅ No cambiar ninguna funcionalidad de visualización existente

## Puntos Críticos a Verificar

1. **Transformación de datos:** El formato de MongoDB debe coincidir EXACTAMENTE con el formato del `rawData` actual
2. **Manejo de fechas:** Las fechas de MongoDB vienen como objetos Date, asegurar conversión correcta
3. **Datos faltantes:** Manejar casos donde `recordTypeSubcategory` sea null/undefined
4. **Performance:** La query no debería tardar más de 2-3 segundos con 2,310+ registros

**IMPORTANTE:** No cambies la lógica de visualización existente en el componente. Solo reemplaza la fuente de datos de estático a dinámico. El resto debe funcionar exactamente igual.
