# Script de Sincronización de Códigos de Procedimientos

**Archivo**: `src/scripts/sync-procedure-codes.ts`  
**Fecha de Creación**: 2024-12-17  
**Estado**: ✅ Implementado y listo para pruebas

---

## 📋 Tabla de Contenidos

- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Problema y Solución](#problema-y-solución)
- [Arquitectura](#arquitectura)
- [Guía de Uso](#guía-de-uso)
- [Casos de Uso](#casos-de-uso)
- [Reportes Generados](#reportes-generados)
- [Troubleshooting](#troubleshooting)
- [FAQs](#faqs)

---

## 📊 Resumen Ejecutivo

Script de migración que sincroniza códigos de procedimientos dentales desde `patientsData` (fuente de verdad) hacia `moneyAccountsData` (ventas), basándose en matching de mismo paciente + mismo día.

### Métricas Objetivo

| Métrica | Valor Esperado |
|---------|---------------|
| **Registros procesados** | ~531 ventas |
| **Tasa de match exitoso** | > 80% |
| **Registros sin match** | < 20% |
| **Múltiples matches** | < 5% |
| **Errores** | 0% |

### Resultados Esperados

- ✅ Mejora en matching entre atenciones y ventas
- ✅ Drill-down funcional con ventas asociadas
- ✅ Análisis financiero completo por procedimiento
- ✅ Auditoría completa con capacidad de rollback

---

## 🔍 Problema y Solución

### Problema Detectado

**Síntoma**: El drill-down de procedimientos no muestra ventas asociadas a las atenciones.

**Causa Raíz**: Códigos de procedimiento inconsistentes entre colecciones:
- `patientsData.recordTypeSubcategory.code` = "RES" (correcto)
- `moneyAccountsData.recordTypeSubcategory.code` = "XXX" (incorrecto)

**Impacto**:
```javascript
// Situación actual (sin sincronización)
{
  attention: {
    code: "RES",
    description: "Restauración Dental"
  },
  matchedPayments: []  // ← Vacío porque códigos no coinciden
}

// Situación deseada (con sincronización)
{
  attention: {
    code: "RES",
    description: "Restauración Dental"
  },
  matchedPayments: [
    {
      amount: 50000,
      date: "2024-03-15",
      code: "RES"  // ← Ahora coincide!
    }
  ]
}
```

### Solución Implementada

Script que:
1. Lee ventas de `moneyAccountsData`
2. Obtiene `patientId` real vía lookup en `personsData`
3. Busca atención coincidente en `patientsData` (mismo paciente + día)
4. Actualiza código y descripción si hay match único
5. Registra toda la operación en `_migrationLog`

---

## 🏗️ Arquitectura

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. LECTURA DE VENTAS                                                │
│                                                                     │
│  moneyAccountsData                                                  │
│  ├─ ownerAccount: "MGyL1bJHV1DK"                                   │
│  ├─ recordTypeCategory.code: "DentalHealthcareServiceItem"         │
│  └─ recordTypeSubcategory.code: "XXX" ← A corregir                │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 2. LOOKUP DE PACIENTE                                               │
│                                                                     │
│  subjectId → personsData._id → personsData.patientId                │
│                                                                     │
│  Ejemplo:                                                            │
│  "P#person123" → personsData → "P#ixYYSxO6f1lM"                    │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 3. BÚSQUEDA DE ATENCIÓN COINCIDENTE                                 │
│                                                                     │
│  patientsData.find({                                                │
│    _id: { $regex: "^P#ixYYSxO6f1lM_" },                            │
│    startDate: { $gte: "2024-03-15T00:00", $lte: "2024-03-15T23:59" },│
│    recordType: "HealthcareStory",                                       │
│    recordTypeCategory.code: "HSMainSubject"                         │
│  })                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 4. EVALUACIÓN DE MATCHES                                            │
│                                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐        │
│  │ Sin Match    │  │ 1 Match (✓)   │  │ Múltiples Matches│        │
│  ├──────────────┤  ├───────────────┤  ├──────────────────┤        │
│  │ No actualizar│  │ Actualizar    │  │ No actualizar    │        │
│  │ Log: no-match│  │ + _migrationLog│  │ Log: multiple   │        │
│  └──────────────┘  └───────────────┘  └──────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 5. ACTUALIZACIÓN CON AUDITORÍA                                      │
│                                                                     │
│  moneyAccountsData.updateOne({                                      │
│    $set: {                                                          │
│      "recordTypeSubcategory.code": "RES",                          │
│      "recordTypeSubcategory.description": "Restauración Dental",   │
│      "_migrationLog": {                                            │
│        migrationId: "procedure-code-sync-2024-12-17",             │
│        timestamp: ISODate(...),                                    │
│        previousValues: { code: "XXX", ... },                       │
│        newValues: { code: "RES", ... },                            │
│        sourceAttentionId: "P#ixYYSxO6f1lM_HS#...",                │
│        matchCriteria: { patientId: "...", date: "..." }            │
│      }                                                              │
│    }                                                                │
│  })                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Colecciones Involucradas

| Colección | Rol | Campos Relevantes |
|-----------|-----|-------------------|
| **patientsData** | 🎯 Fuente de verdad | `_id`, `recordTypeSubcategory.code`, `startDate`, `recordType`, `recordTypeCategory.code` |
| **moneyAccountsData** | ✏️ A actualizar | `_id`, `subjectId`, `recordTypeSubcategory.code`, `date`, `recordTypeCategory.code` |
| **personsData** | 🔗 Lookup | `_id`, `patientId` |

### Estructura del Migration Log

```typescript
interface MigrationLog {
  migrationId: string;          // "procedure-code-sync-2024-12-17"
  timestamp: Date;              // Fecha/hora de migración
  action: string;               // "recordTypeSubcategory-sync"
  previousValues: {
    code: string;               // Código anterior
    description: string;        // Descripción anterior
  };
  newValues: {
    code: string;               // Código nuevo (de patientsData)
    description: string;        // Descripción nueva
  };
  sourceAttentionId: string;    // ID de atención origen
  matchCriteria: {
    patientId: string;          // Paciente usado para match
    date: string;               // Fecha usada para match (YYYY-MM-DD)
  };
  rolledBack?: boolean;         // true si se revirtió
  rollbackTimestamp?: Date;     // Fecha/hora de rollback
}
```

---

## 📖 Guía de Uso

### Pre-requisitos

1. **Variables de entorno** (`.env.local`):
   ```env
   MONGODB_URI=mongodb+srv://...
   MONGODB_DATABASE=sakdental
   ```

2. **Dependencias instaladas**:
   ```bash
   npm install
   ```

3. **Acceso a MongoDB** con permisos de lectura/escritura

### Flujo de Trabajo Recomendado

#### 1️⃣ Prueba con Dataset Pequeño

```bash
npm run sync:codes:test
```

**Qué hace**: Procesa solo 10 registros  
**Objetivo**: Validar que la lógica de matching funcione correctamente

**Output esperado**:
```
🧪 TEST MODE - Processing only 10 records

🔄 Connected to MongoDB
📂 Database: sakdental
👤 Owner Account: MGyL1bJHV1DK

🔍 Fetching sales records from moneyAccountsData...

📊 Found 10 sales records to process

[DRY RUN] Would update 67abc...: XXX → RES
[DRY RUN] Would update 89def...: YYY → END
...

Total processed: 10
✅ Updated: 8
⚠️  No match found: 2
```

**Validar**:
- ✅ Los códigos de destino son correctos
- ✅ Los matches tienen sentido (mismo paciente + día)
- ✅ No hay errores de conexión o queries

#### 2️⃣ Dry Run Completo

```bash
npm run sync:codes
```

**Qué hace**: Simula migración completa sin hacer cambios  
**Objetivo**: Obtener estadísticas del dataset completo

**Output esperado**:
```
======================================================================
📊 MIGRATION SUMMARY
======================================================================
Migration ID: procedure-code-sync-2024-12-17
Mode: DRY RUN

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
   ...
======================================================================

💡 This was a DRY RUN - no changes were made
   Run with --execute to apply the changes
```

**Validar**:
- ✅ Tasa de no-match < 20% (idealmente < 10%)
- ✅ Múltiples matches < 5%
- ✅ No hay errores
- ✅ Los códigos más frecuentes tienen sentido

**⚠️ Si tasa de no-match > 20%**:
```bash
# Revisar archivo de no-match
cat helpers/migration-reports/no-match-records-*.json | jq '.[] | select(.reason) | .reason' | sort | uniq -c
```

#### 3️⃣ Revisar Casos Especiales

**No-match records**:
```bash
# Ver primeros 5 registros sin match
cat helpers/migration-reports/no-match-records-*.json | jq '.[:5]'
```

Analizar:
- ¿Falta el `patientId` en `personsData`?
- ¿Las fechas están desalineadas (ej: venta días después)?
- ¿Hay atenciones registradas para ese paciente/día?

**Multiple-match records**:
```bash
# Ver casos ambiguos
cat helpers/migration-reports/multiple-match-records-*.json | jq '.[:5]'
```

Analizar:
- ¿El paciente tuvo múltiples atenciones el mismo día?
- ¿Son códigos diferentes o el mismo código repetido?
- ¿Requiere intervención manual?

#### 4️⃣ Ejecutar Migración

```bash
npm run sync:codes:execute
```

**Qué hace**: Ejecuta la migración real con cambios permanentes  
**Confirmación requerida**: Sí, el script pedirá confirmación después de mostrar preview

**Preview antes de confirmar**:
```
📋 Preview of first 5 records to be processed:

  1. ID: 67abc...
     Date: 2024-03-15
     Current Code: XXX
     Subject ID: P#person123

  ...

⚠️  You are about to modify 531 records. Continue? (yes/no):
```

**Monitoreo durante ejecución**:
```
⏳ Processing... 50/531
⏳ Processing... 100/531
⏳ Processing... 150/531
...
✅ Migration completed successfully!
```

#### 5️⃣ Validar Resultados

**Ver reporte completo**:
```bash
npm run sync:codes:report
```

**Validar en MongoDB**:
```javascript
// Verificar que se agregó _migrationLog
db.moneyAccountsData.findOne({
  "_migrationLog.migrationId": "procedure-code-sync-2024-12-17"
})

// Contar registros migrados
db.moneyAccountsData.countDocuments({
  "_migrationLog.migrationId": "procedure-code-sync-2024-12-17"
})

// Ver distribución de códigos actualizados
db.moneyAccountsData.aggregate([
  { $match: { "_migrationLog.migrationId": "procedure-code-sync-2024-12-17" } },
  { $group: { 
      _id: "$_migrationLog.newValues.code", 
      count: { $sum: 1 } 
  } },
  { $sort: { count: -1 } }
])
```

**Validar en Analytics**:
1. Acceder al dashboard de procedimientos
2. Hacer drill-down en un procedimiento frecuente (ej: RES)
3. Verificar que ahora aparezcan `matchedPayments`
4. Comparar antes/después de migración

#### 6️⃣ Rollback (si es necesario)

```bash
npm run sync:codes:rollback -- --migration-id="procedure-code-sync-2024-12-17"
```

**Cuándo usar**:
- Resultados inesperados en validación
- Error detectado en lógica de matching
- Solicitud de negocio para revertir cambios

**Qué hace**:
- Busca todos los registros con ese `migrationId`
- Restaura valores de `previousValues`
- Marca como `rolledBack: true`
- Genera reporte de rollback

**Confirmación requerida**: Sí

---

## 💼 Casos de Uso

### Caso 1: Primera Ejecución (Migración Inicial)

**Escenario**: Primera vez ejecutando el script, dataset completo sin sincronizar.

**Pasos**:
1. `npm run sync:codes:test` - Probar con 10 registros
2. `npm run sync:codes` - Dry run completo
3. Revisar reportes de no-match y múltiples matches
4. `npm run sync:codes:execute` - Ejecutar migración
5. `npm run sync:codes:report` - Verificar resultados
6. Validar en analytics dashboard

**Tiempo estimado**: 30-45 minutos

---

### Caso 2: Actualización Incremental

**Escenario**: Ya se ejecutó una vez, pero hay nuevos registros que necesitan sincronización.

**Pasos**:
1. `npm run sync:codes` - Dry run
2. El script automáticamente omitirá registros ya sincronizados
3. `npm run sync:codes:execute` - Actualizar solo los nuevos
4. Revisar reporte (la mayoría debería estar "already synced")

**Tiempo estimado**: 10-15 minutos

---

### Caso 3: Corrección de Datos

**Escenario**: Se detectó que algunos códigos en `patientsData` se corrigieron y necesitas re-sincronizar.

**Pasos**:
1. Identificar registros afectados en `moneyAccountsData`
2. Eliminar `_migrationLog` de esos registros (para que sean re-procesados):
   ```javascript
   db.moneyAccountsData.updateMany(
     { 
       "_migrationLog.sourceAttentionId": { 
         $in: ["ID1", "ID2", "ID3"] 
       } 
     },
     { $unset: { _migrationLog: "" } }
   )
   ```
3. `npm run sync:codes:execute` - Re-ejecutar migración

**Tiempo estimado**: 15-20 minutos

---

### Caso 4: Investigación de No-Match

**Escenario**: Después del dry run, tienes 25% de registros sin match y necesitas investigar.

**Pasos**:
1. `npm run sync:codes` - Generar reporte
2. Revisar `no-match-records-*.json`:
   ```bash
   cat helpers/migration-reports/no-match-records-*.json | jq -r '.[] | .reason' | sort | uniq -c
   ```
3. Agrupar por razón común:
   - "No patientId found" → Problema en `personsData`
   - "No matching attention" → Posible problema de fechas o registros faltantes

4. Query para investigar casos específicos:
   ```javascript
   // Ejemplo: Ver detalles de un registro sin match
   const saleId = "67abc...";
   const sale = db.moneyAccountsData.findOne({ _id: ObjectId(saleId) });
   const person = db.personsData.findOne({ _id: sale.subjectId });
   
   // Buscar atenciones del paciente cerca de esa fecha
   db.patientsData.find({
     _id: { $regex: `^${person.patientId}_` },
     startDate: {
       $gte: ISODate(sale.date.setHours(0,0,0)),
       $lte: ISODate(sale.date.setHours(23,59,59))
     }
   })
   ```

5. Decidir acción:
   - Si es error de datos: Corregir datos fuente y re-ejecutar
   - Si es esperado (ej: venta sin atención): Documentar y continuar

**Tiempo estimado**: 1-2 horas

---

## 📊 Reportes Generados

### 1. Migration Report (Principal)

**Ubicación**: `helpers/migration-reports/migration-report-{timestamp}.json`

**Estructura**:
```json
{
  "migrationId": "procedure-code-sync-2024-12-17",
  "timestamp": "2024-12-17T10:30:00.000Z",
  "mode": "execute",
  "summary": {
    "totalProcessed": 531,
    "updated": 450,
    "noMatch": 50,
    "multipleMatches": 20,
    "alreadySynced": 11,
    "errors": 0,
    "byProcedureCode": {
      "RES": { "updated": 200, "noMatch": 10 },
      "OTD": { "updated": 150, "noMatch": 15 },
      "END": { "updated": 50, "noMatch": 8 },
      "EXO": { "updated": 30, "noMatch": 7 },
      "PER": { "updated": 20, "noMatch": 10 }
    }
  },
  "noMatchRecords": [...],
  "multipleMatchRecords": [...],
  "errors": []
}
```

**Uso**:
- Auditoría completa de la migración
- Análisis de cobertura por tipo de procedimiento
- Identificación de patrones en no-matches

---

### 2. No-Match Records

**Ubicación**: `helpers/migration-reports/no-match-records-{timestamp}.json`

**Estructura**:
```json
[
  {
    "_id": "67abc123...",
    "date": "2024-03-15",
    "patientId": "P#ixYYSxO6f1lM",
    "currentCode": "XXX",
    "reason": "No matching attention found for same patient + same day"
  },
  {
    "_id": "89def456...",
    "date": "2024-04-20",
    "patientId": null,
    "currentCode": "YYY",
    "reason": "No patientId found via personsData lookup"
  }
]
```

**Uso**:
- Identificar registros que requieren atención manual
- Detectar problemas sistemáticos de datos
- Priorizar correcciones de datos

**Análisis común**:
```bash
# Contar razones de no-match
jq -r '.[].reason' no-match-records-*.json | sort | uniq -c

# Exportar para Excel
jq -r '.[] | [._id, .date, .patientId, .currentCode, .reason] | @csv' \
  no-match-records-*.json > no-match.csv
```

---

### 3. Multiple-Match Records

**Ubicación**: `helpers/migration-reports/multiple-match-records-{timestamp}.json`

**Estructura**:
```json
[
  {
    "_id": "67xyz789...",
    "date": "2024-05-10",
    "patientId": "P#ixYYSxO6f1lM",
    "currentCode": "XXX",
    "possibleMatches": [
      {
        "attentionId": "P#ixYYSxO6f1lM_HS#match1",
        "code": "RES",
        "description": "Restauración Dental"
      },
      {
        "attentionId": "P#ixYYSxO6f1lM_HS#match2",
        "code": "END",
        "description": "Endodoncia"
      }
    ]
  }
]
```

**Uso**:
- Identificar casos ambiguos que necesitan decisión manual
- Entender patrones de múltiples atenciones por día
- Decidir reglas de desempate si es necesario

**Análisis**:
```bash
# Ver distribución de cantidad de matches
jq '.[] | .possibleMatches | length' multiple-match-records-*.json | sort | uniq -c

# Ver si los múltiples matches son del mismo código o diferentes
jq '.[] | {id: ._id, codes: [.possibleMatches[].code] | unique}' \
  multiple-match-records-*.json
```

---

### 4. Rollback Report

**Ubicación**: `helpers/migration-reports/rollback-report-{timestamp}.json`

**Estructura**:
```json
{
  "migrationId": "procedure-code-sync-2024-12-17",
  "timestamp": "2024-12-17T14:30:00.000Z",
  "rolledBack": 450,
  "errors": 0
}
```

**Uso**:
- Confirmar que el rollback se ejecutó correctamente
- Auditar operaciones de reversión

---

## 🔧 Troubleshooting

### Error: "MONGODB_URI environment variable is not defined"

**Causa**: Falta archivo `.env.local` o variable no configurada

**Solución**:
```bash
# Crear .env.local en raíz del proyecto
echo 'MONGODB_URI=mongodb+srv://...' > .env.local
echo 'MONGODB_DATABASE=sakdental' >> .env.local
```

---

### Error: "MongoServerError: Authentication failed"

**Causa**: Credenciales incorrectas o usuario sin permisos

**Solución**:
1. Verificar credenciales en MongoDB Atlas
2. Asegurar que el usuario tenga permisos de lectura/escritura
3. Verificar que la IP esté en la whitelist

---

### Advertencia: "> 20% de registros sin match"

**Causa**: Alta proporción de ventas sin atención correspondiente

**Investigación**:
```bash
# Ver distribución temporal de no-matches
jq -r '.[] | .date' no-match-records-*.json | cut -d'-' -f1-2 | sort | uniq -c

# Ver si hay patrones por código
jq -r '.[] | .currentCode' no-match-records-*.json | sort | uniq -c
```

**Posibles causas**:
1. **Datos faltantes en `patientsData`**: Algunas atenciones no fueron registradas
2. **Desfase temporal**: La venta se registró días después de la atención
3. **Problema en `personsData`**: Falta el campo `patientId` en algunos registros
4. **Diferencia en filtros**: Algunos registros no cumplen los filtros de `recordType` o `recordTypeCategory`

**Decisión**:
- Si < 15%: Aceptable, continuar con migración
- Si 15-25%: Investigar muestras, decidir si corregir primero
- Si > 25%: Detener, corregir datos fuente antes de migrar

---

### Script se detiene en "Processing... X/Y"

**Causa**: Posible timeout de MongoDB o registro problemático

**Diagnóstico**:
```bash
# Ver logs del terminal
tail -f ~/.cursor/projects/.../terminals/1.txt

# Verificar conexión a MongoDB
mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')"
```

**Solución**:
1. Re-ejecutar el script (omitirá registros ya procesados)
2. Si persiste, ejecutar con `--test-limit` para identificar registro problemático:
   ```bash
   tsx src/scripts/sync-procedure-codes.ts --execute --test-limit=50
   ```
3. Revisar logs de error en el reporte generado

---

### Rollback no encuentra registros

**Causa**: Migration ID incorrecto o registros ya revertidos

**Verificación**:
```javascript
// Ver migration IDs disponibles
db.moneyAccountsData.distinct("_migrationLog.migrationId")

// Ver registros de una migración específica
db.moneyAccountsData.countDocuments({
  "_migrationLog.migrationId": "procedure-code-sync-2024-12-17",
  "_migrationLog.rolledBack": { $ne: true }
})
```

**Solución**:
- Usar el migration ID correcto (ver en reportes o query arriba)
- Si ya está rolled back, los registros tendrán `rolledBack: true`

---

## ❓ FAQs

### ¿Puedo ejecutar el script múltiples veces?

**Sí**, el script es idempotente. En ejecuciones posteriores:
- Registros ya sincronizados se omitirán (contados en `alreadySynced`)
- Solo se procesarán registros nuevos o modificados
- No hay riesgo de duplicar `_migrationLog`

---

### ¿Qué pasa si hay nuevas ventas después de la migración?

Dos opciones:

1. **Re-ejecutar el script periódicamente**:
   ```bash
   npm run sync:codes:execute
   ```
   El script automáticamente procesará solo los nuevos registros.

2. **Implementar sincronización automática en la aplicación**:
   - Al crear una nueva venta, hacer lookup inmediato de la atención
   - Copiar código correcto en tiempo real
   - No depender del script de migración

**Recomendación**: Opción 2 para producción (prevenir el problema en origen)

---

### ¿Cómo manejo los registros con múltiples matches?

**Opciones**:

1. **Análisis manual**:
   - Revisar `multiple-match-records-*.json`
   - Para cada caso, determinar el match correcto
   - Actualizar manualmente:
     ```javascript
     db.moneyAccountsData.updateOne(
       { _id: ObjectId("67xyz...") },
       { 
         $set: { 
           "recordTypeSubcategory.code": "RES",
           "recordTypeSubcategory.description": "Restauración Dental",
           "_migrationLog": {
             migrationId: "manual-correction-2024-12-17",
             // ... resto del log
           }
         } 
       }
     )
     ```

2. **Implementar regla de desempate en el script**:
   - Ej: "Elegir la atención más cercana en hora a la venta"
   - Ej: "Elegir la atención con código más frecuente para ese paciente"
   - Modificar el script y re-ejecutar

3. **Aceptar y documentar**:
   - Si son pocos casos (< 5%), puede ser aceptable no procesarlos
   - Documentar como limitación conocida

**Recomendación**: Opción 1 para primeros 10-20 casos, luego opción 2 si hay patrón claro

---

### ¿El script afecta el performance de la base de datos?

**Impacto durante ejecución**:
- 🔴 **Escritura**: ~500 updates en `moneyAccountsData`
- 🟡 **Lectura**: ~500 queries a `personsData` y ~500 a `patientsData`
- ⏱️ **Duración estimada**: 2-5 minutos para 500 registros

**Mitigación**:
- El script usa conexiones limitadas (`maxPoolSize: 10`)
- Los queries tienen índices (asumiendo índices en `_id` y `date`)
- Se puede ejecutar en horarios de bajo tráfico

**Recomendación**:
- Primera ejecución: Horario de bajo tráfico (ej: noche o fin de semana)
- Ejecuciones subsecuentes: Cualquier horario (procesará menos registros)

---

### ¿Qué hago si detecto un error en la lógica después de ejecutar?

**Pasos**:

1. **No entrar en pánico** - Hay rollback completo 😊

2. **Rollback inmediato**:
   ```bash
   npm run sync:codes:rollback -- --migration-id="procedure-code-sync-2024-12-17"
   ```

3. **Analizar el error**:
   - ¿Qué registros se afectaron?
   - ¿Cuál fue la lógica incorrecta?
   - ¿Cómo se debe corregir?

4. **Corregir el script**:
   - Modificar `src/scripts/sync-procedure-codes.ts`
   - Agregar tests si es necesario

5. **Re-ejecutar con test**:
   ```bash
   npm run sync:codes:test
   ```

6. **Ejecutar migración corregida**:
   ```bash
   npm run sync:codes:execute
   ```
   Esto creará un nuevo `migrationId` con fecha actual.

---

### ¿Puedo filtrar qué registros procesar?

**Sí**, modificando el query en el script:

```typescript
// En sync-procedure-codes.ts, línea ~200
const query: any = {
  ownerAccount: OWNER_ACCOUNT,
  "recordTypeCategory.code": "DentalHealthcareServiceItem",
  
  // Agregar filtros adicionales:
  // date: { $gte: new Date("2024-01-01") },  // Solo 2024+
  // "recordTypeSubcategory.code": "XXX",     // Solo código específico
};
```

**Alternativa sin modificar código**:
- Usar `--test-limit` para procesar subconjunto
- Ejecutar múltiples veces con diferentes filtros manuales en MongoDB

---

### ¿Los reportes JSON incluyen información sensible?

**No**, los reportes incluyen solo:
- IDs de documentos (no revelan información personal)
- Códigos de procedimiento (públicos, ej: "RES")
- Fechas (sin hora exacta, solo día)
- Estadísticas agregadas

**Sin información sensible**:
- ❌ Nombres de pacientes
- ❌ Números de identificación
- ❌ Montos exactos de ventas
- ❌ Información médica detallada

**Ubicación**: `helpers/migration-reports/` (no versionado en git si está en `.gitignore`)

---

## 📚 Referencias

- **Script principal**: `/src/scripts/sync-procedure-codes.ts`
- **Documentación de scripts**: `/src/scripts/README.md`
- **Plan de implementación**: `/documentation/procedure-drill-down-implementation-plan.md`
- **MongoDB Docs**: [Update Operators](https://www.mongodb.com/docs/manual/reference/operator/update/)
- **TypeScript Node**: [tsx](https://github.com/esbuild-kit/tsx)

---

## 📝 Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2024-12-17 | Implementación inicial completa |

---

**Estado**: ✅ Listo para pruebas  
**Próximo paso**: `npm run sync:codes:test`  
**Autor**: Dentanum Development Team  
**Última actualización**: 2024-12-17

