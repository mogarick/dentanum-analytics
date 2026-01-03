# 🔍 Especificación: Búsqueda Avanzada en Drill-Down de Procedimientos

**Fecha de Creación**: 2026-01-03  
**Estado**: 📋 PENDIENTE - Fase Futura  
**Prioridad**: 🟡 Media  
**Estimación**: 2-3 días de desarrollo

---

## 📋 Resumen

Implementar un sistema de búsqueda avanzada en la vista de drill-down de procedimientos que permita buscar en notas de atención, motivos de consulta, y potencialmente otros campos, utilizando MongoDB Text Search para búsquedas eficientes en toda la base de datos.

---

## 🎯 Objetivos

### Objetivos Principales

1. **Búsqueda en todos los registros**: No limitarse a los 100 registros cargados
2. **Búsqueda eficiente**: Usar índices de MongoDB para búsquedas rápidas
3. **Búsqueda relevante**: Ordenar resultados por relevancia
4. **Búsqueda en español**: Soportar stop words y stemming en español

### Objetivos Secundarios

1. **Búsqueda multi-campo**: Buscar en notas, motivos, y otros campos
2. **Búsqueda por frases**: Soportar búsquedas exactas con comillas
3. **Highlight de resultados**: Resaltar términos encontrados en los resultados
4. **Historial de búsquedas**: Guardar búsquedas recientes del usuario

---

## 🔧 Especificación Técnica

### 1. Índice de MongoDB

**Colección**: `patientsData` (HealthcareStory)

**Campos a indexar**:
```javascript
db.patientsData.createIndex(
  {
    note: "text",
    reason: "text",
    // Opcional: agregar más campos
    // "patientName": "text",
    // "diagnosis": "text"
  },
  {
    name: "healthcare_story_text_search",
    default_language: "spanish",
    weights: {
      note: 10,      // Mayor peso a notas (más importante)
      reason: 5      // Menor peso a motivos
    }
  }
);
```

**Configuración**:
- **Lenguaje**: `spanish` (para stop words correctos)
- **Pesos**: Notas tienen mayor relevancia que motivos
- **Nombre**: `healthcare_story_text_search` (para referencia)

### 2. Backend: Actualizar Service

**Archivo**: `src/services/procedureDetailService.server.ts`

**Cambios**:

```typescript
// 1. Agregar campo searchText a ProcedureDetailFilters
export interface ProcedureDetailFilters {
  procedureCode: string;
  year?: string;
  month?: string;
  day?: string;
  searchText?: string;  // NUEVO
}

// 2. Actualizar función fetchHealthcareStories
async function fetchHealthcareStories(
  filters: ProcedureDetailFilters
): Promise<HealthcareStory[]> {
  const matchStage: Record<string, unknown> = {
    ownerAccount: OWNER_ACCOUNT,
    recordType: "HealthcareStory",
    "recordTypeCategory.code": "HSMainSubject",
    "recordTypeSubcategory.code": filters.procedureCode,
    startDate: { $ne: null },
  };

  // Agregar filtro de fecha si existe
  if (filters.year || filters.month || filters.day) {
    // ... código existente ...
  }

  // NUEVO: Agregar búsqueda de texto si existe
  if (filters.searchText && filters.searchText.trim() !== "") {
    matchStage.$text = { 
      $search: filters.searchText,
      $language: "spanish"
    };
  }

  const pipeline: Record<string, unknown>[] = [
    { $match: matchStage },
    // NUEVO: Si hay búsqueda, agregar score de relevancia
    ...(filters.searchText ? [
      { 
        $addFields: { 
          searchScore: { $meta: "textScore" } 
        } 
      },
      { 
        $sort: { 
          searchScore: -1,  // Ordenar por relevancia primero
          startDate: -1     // Luego por fecha
        } 
      }
    ] : [
      { $sort: { startDate: -1 } }
    ]),
    {
      $project: {
        _id: 1,
        patientId: 1,
        startDate: 1,
        note: 1,
        reason: 1,
        "recordTypeSubcategory.code": 1,
        "recordTypeSubcategory.description": 1,
        ...(filters.searchText ? { searchScore: 1 } : {})
      },
    },
  ];

  const results = await healthcareStoryDataCollection
    .aggregate<HealthcareStory>(pipeline)
    .toArray();

  return results;
}
```

### 3. Frontend: Actualizar Componente

**Archivo**: `src/components/drill-down/ProcedureDetailPage.tsx`

**Cambios**:

```typescript
// 1. Agregar estado para búsqueda
const [searchText, setSearchText] = useState("");
const [isSearching, setIsSearching] = useState(false);

// 2. Función para manejar búsqueda (con debounce)
const handleSearch = useMemo(
  () =>
    debounce(async (text: string) => {
      if (text.trim() === "") {
        // Limpiar búsqueda
        return;
      }
      
      setIsSearching(true);
      
      // Recargar datos con búsqueda
      const url = new URL(window.location.href);
      url.searchParams.set("search", text);
      window.location.href = url.toString();
    }, 500),
  []
);

// 3. Componente de búsqueda
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    🔍 Buscar en Notas y Motivos
  </label>
  <input
    type="text"
    value={searchText}
    onChange={(e) => {
      setSearchText(e.target.value);
      handleSearch(e.target.value);
    }}
    placeholder="Ej: dolor, caries, restauración..."
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  {isSearching && (
    <p className="text-sm text-gray-500 mt-1">
      🔄 Buscando...
    </p>
  )}
</div>
```

### 4. Loader: Extraer searchText de URL

**Archivo**: `src/routes/procedure-detail.tsx`

```typescript
export async function loader({ params, request }: Route.LoaderArgs) {
  const { procedureCode } = params;
  
  if (!procedureCode) {
    throw new Response("Procedure code is required", { status: 400 });
  }

  const url = new URL(request.url);
  const year = url.searchParams.get("year") || undefined;
  const month = url.searchParams.get("month") || undefined;
  const day = url.searchParams.get("day") || undefined;
  const searchText = url.searchParams.get("search") || undefined;  // NUEVO
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const filters: ProcedureDetailFilters = {
    procedureCode,
    year,
    month,
    day,
    searchText,  // NUEVO
  };

  try {
    const data = await getConsolidatedRecords(filters, page, 100);
    return data;
  } catch (error) {
    console.error("Error loading procedure detail:", error);
    throw new Response("Failed to load procedure data", { status: 500 });
  }
}
```

---

## 🎨 Diseño de UI

### Componente de Búsqueda

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Buscar en Notas y Motivos                        │
│ ┌─────────────────────────────────────────────────┐ │
│ │ dolor de muela                            [🔍]  │ │
│ └─────────────────────────────────────────────────┘ │
│ 💡 Tip: Usa comillas para búsqueda exacta          │
└─────────────────────────────────────────────────────┘
```

### Resultados con Highlight

```
┌─────────────────────────────────────────────────────┐
│ 📝 NOTA DE ATENCIÓN                                 │
│                                                     │
│ Paciente acude por **dolor de muela** superior     │
│ derecha. Se observa caries en molar 16...          │
│                                                     │
│ 🔍 Relevancia: ⭐⭐⭐⭐⭐ (95%)                      │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Casos de Uso

### Caso 1: Búsqueda Simple

**Input**: `"dolor"`  
**Resultado**: Todos los registros que contengan "dolor" en nota o motivo  
**Ordenamiento**: Por relevancia (más menciones = mayor score)

### Caso 2: Búsqueda Multi-término

**Input**: `"dolor muela"`  
**Resultado**: Registros que contengan "dolor" Y "muela"  
**Ordenamiento**: Por relevancia (ambos términos cerca = mayor score)

### Caso 3: Búsqueda Exacta

**Input**: `"dolor de muela"`  
**Resultado**: Registros con la frase exacta "dolor de muela"  
**Ordenamiento**: Por relevancia

### Caso 4: Búsqueda con Stop Words

**Input**: `"el dolor de la muela"`  
**MongoDB**: Ignora "el", "de", "la" (stop words en español)  
**Búsqueda efectiva**: `"dolor muela"`

---

## 🧪 Testing

### Test Cases

| ID | Descripción | Input | Resultado Esperado |
|----|-------------|-------|-------------------|
| TC-01 | Búsqueda simple | "dolor" | Registros con "dolor" |
| TC-02 | Búsqueda multi-término | "dolor muela" | Registros con ambos términos |
| TC-03 | Búsqueda exacta | "\"dolor de muela\"" | Frase exacta |
| TC-04 | Stop words | "el dolor" | Ignora "el" |
| TC-05 | Sin resultados | "xyz123" | Mensaje "No se encontraron resultados" |
| TC-06 | Búsqueda vacía | "" | Mostrar todos los registros |
| TC-07 | Case insensitive | "DOLOR" | Igual que "dolor" |
| TC-08 | Acentos | "caries" | Encuentra "caries" y "cáries" |

### Performance Testing

- **Objetivo**: < 500ms para búsquedas en 10,000+ registros
- **Método**: Usar índice de texto de MongoDB
- **Validación**: Ejecutar `explain()` en queries

---

## 📈 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| **Tiempo de respuesta** | < 500ms |
| **Precisión** | > 90% de resultados relevantes |
| **Recall** | > 95% de registros relevantes encontrados |
| **Satisfacción de usuario** | > 4/5 estrellas |

---

## 🚀 Plan de Implementación

### Fase 1: Setup (0.5 días)
- [ ] Crear índice de texto en MongoDB
- [ ] Validar índice con queries de prueba
- [ ] Documentar índice en README

### Fase 2: Backend (1 día)
- [ ] Actualizar `ProcedureDetailFilters` interface
- [ ] Modificar `fetchHealthcareStories` para soportar búsqueda
- [ ] Agregar ordenamiento por relevancia
- [ ] Testing de queries

### Fase 3: Frontend (1 día)
- [ ] Crear componente de búsqueda
- [ ] Implementar debounce
- [ ] Agregar loading state
- [ ] Agregar highlight de términos (opcional)

### Fase 4: Testing (0.5 días)
- [ ] Ejecutar test cases
- [ ] Performance testing
- [ ] User acceptance testing

---

## 🔒 Consideraciones de Seguridad

1. **Sanitización de input**: Validar y sanitizar texto de búsqueda
2. **Rate limiting**: Limitar número de búsquedas por usuario/minuto
3. **Injection prevention**: MongoDB Text Search es seguro contra injection
4. **Permisos**: Solo buscar en registros del `ownerAccount` del usuario

---

## 💰 Costo Estimado

### Recursos

- **Desarrollo**: 2-3 días (16-24 horas)
- **Testing**: 0.5 días (4 horas)
- **Documentación**: 0.5 días (4 horas)
- **Total**: 3-4 días

### Infraestructura

- **Índice de MongoDB**: ~50-100 MB adicionales (estimado)
- **Performance**: Mejora significativa vs búsqueda client-side
- **Costo**: Mínimo (índice se crea una vez)

---

## 📚 Referencias

- [MongoDB Text Search](https://www.mongodb.com/docs/manual/text-search/)
- [Spanish Language Support](https://www.mongodb.com/docs/manual/reference/text-search-languages/#std-label-text-search-languages)
- [Text Search Performance](https://www.mongodb.com/docs/manual/core/index-text/#std-label-text-index-performance)

---

## 🎯 Decisión de Implementación

**Estado Actual**: 📋 PENDIENTE  
**Razón**: La búsqueda client-side actual solo busca en 100 registros cargados, lo cual es limitado y no es útil para el caso de uso actual.

**Próximos Pasos**:
1. Validar con usuarios si la búsqueda es una necesidad prioritaria
2. Si es prioritaria, implementar según este spec
3. Si no es prioritaria, mantener en backlog para futuras fases

---

## ✅ Criterios de Aceptación

- [ ] Búsqueda funciona en TODOS los registros (no solo los 100 cargados)
- [ ] Tiempo de respuesta < 500ms
- [ ] Soporta búsqueda en español (stop words)
- [ ] Ordenamiento por relevancia funciona correctamente
- [ ] UI es intuitiva y fácil de usar
- [ ] No hay errores de performance o seguridad
- [ ] Documentación completa creada
- [ ] Tests pasando al 100%

---

**Última Actualización**: 2026-01-03  
**Autor**: AI Assistant  
**Revisión Pendiente**: Usuario

