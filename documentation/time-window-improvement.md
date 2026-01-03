# Mejora de Ventana de Tiempo para Conciliación

**Fecha**: 2026-01-03  
**Versión**: 1.0.0  
**Estado**: ✅ IMPLEMENTADO Y PROBADO

---

## 📋 Resumen Ejecutivo

Se implementó una mejora en el algoritmo de conciliación para ampliar la ventana de búsqueda de **mismo día** a **-24 horas a +72 horas**. Esta mejora reconoce el comportamiento real de los consultorios dentales donde los cargos pueden registrarse antes (pagos adelantados) o después (pagos diferidos) de la atención.

### Resultados

- **Tasa de conciliación**: 44.8% → **45.7%** (+0.9 puntos porcentuales)
- **Registros adicionales conciliados**: 5
- **Sin errores**: ✅ Implementación limpia sin breaking changes

---

## 🎯 Problema Identificado

### Comportamiento Previo

El sistema solo buscaba coincidencias en el **mismo día** (función `isSameDay`):
- ✅ Atención 10:00 AM, Venta 3:00 PM → Match
- ❌ Atención Viernes, Venta Lunes → NO Match
- ❌ Pago adelantado día anterior → NO Match

### Casos de Uso Reales

1. **Venta ANTES de la atención** (común):
   - Paciente paga por adelantado el día anterior
   - Se registra el cargo cuando confirma la cita
   - Ejemplo: Paga el viernes, atención el lunes

2. **Venta DESPUÉS de la atención** (más común):
   - Registran cuando reciben el pago/transferencia
   - Ejemplo: Atención el lunes, pago/registro el martes o miércoles

---

## 🔧 Solución Implementada

### Ventana de Búsqueda

```
-24 horas ← ATENCIÓN → +72 horas
(1 día antes)         (3 días después)
```

### Clasificación de Matches

| Tipo | Rango de Tiempo | Descripción |
|------|----------------|-------------|
| **Perfect Match** | -3h a +3h | Registro inmediato/casi inmediato |
| **Likely Match** | -24h a -3h o +3h a +72h | Pago adelantado o diferido |
| **Attention Only** | Sin venta en ventana | No se encontró venta asociada |

### Razones para 72 horas (3 días)

1. ✅ **Cubre fines de semana**: Viernes → Lunes (3 días)
2. ✅ **Reduce ambigüedad**: Menos probabilidad de múltiples atenciones del mismo paciente
3. ✅ **Realista**: Cubre el caso de "registrar cuando llega el pago/transferencia"
4. ✅ **No demasiado permisivo**: Evita matches incorrectos

---

## 💻 Cambios en el Código

### 1. Nueva función `isWithinTimeWindow` en `dateUtils.ts`

```typescript
/**
 * Verifica si una fecha de venta está dentro de la ventana de tiempo de una atención
 * Ventana: -24 horas (pago adelantado) a +72 horas (pago diferido)
 */
export function isWithinTimeWindow(saleDate: Date | string, attentionDate: Date | string): boolean {
  const sale = typeof saleDate === "string" ? new Date(saleDate) : saleDate;
  const attention = typeof attentionDate === "string" ? new Date(attentionDate) : attentionDate;

  if (isNaN(sale.getTime()) || isNaN(attention.getTime())) {
    return false;
  }

  const diffMs = sale.getTime() - attention.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Ventana: -24 horas a +72 horas
  return diffHours >= -24 && diffHours <= 72;
}
```

### 2. Nueva función `calculateTimeDifferenceHours` en `dateUtils.ts`

```typescript
/**
 * Calcula la diferencia en horas entre dos fechas (puede ser negativa)
 * @returns Diferencia en horas (negativa si date1 es antes que date2)
 */
export function calculateTimeDifferenceHours(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return 0;
  }

  const diffMs = d1.getTime() - d2.getTime();
  return diffMs / (1000 * 60 * 60);
}
```

### 3. Actualización en `procedureDetailService.server.ts`

**Antes:**
```typescript
const sameDay = isSameDay(sale.date, attention.startDate);
return samePatient && sameDay;
```

**Después:**
```typescript
const withinWindow = isWithinTimeWindow(sale.date, attention.startDate);
return samePatient && withinWindow;
```

### 4. Actualización en `determineConciliationStatus`

**Antes:**
```typescript
const threeHoursInMinutes = 3 * 60;
if (timeDiffMinutes <= threeHoursInMinutes) {
  return "perfect-match";
}
```

**Después:**
```typescript
if (timeDiffHours !== undefined) {
  const absHours = Math.abs(timeDiffHours);
  
  // Perfect Match: -3h a +3h (registro inmediato/casi inmediato)
  if (absHours <= 3) {
    return "perfect-match";
  }
  
  // Likely Match: -24h a -3h o +3h a +72h (pago adelantado o diferido)
  return "likely-match";
}
```

---

## 📊 Resultados de Pruebas

### Comparación Antes vs Después

| Métrica | Antes (mismo día) | Después (-24h a +72h) | Mejora |
|---------|-------------------|----------------------|--------|
| **Total Registros** | 753 | 748 | -5 |
| **✅ Perfect Match** | 276 | 276 | = |
| **⚠️ Sin Venta** | 216 | 211 | -5 |
| **❌ Sin Atención** | 200 | 195 | -5 |
| **Tasa de conciliación** | 44.8% | **45.7%** | **+0.9%** |
| **Total ventas** | $446,450.00 | $446,450.00 | = |

### Análisis de Resultados

1. **5 registros adicionales conciliados**: Registros que antes aparecían como "Sin Venta" o "Sin Atención" ahora encontraron su match.
2. **Perfect Match sin cambios**: Los registros con match perfecto (≤3 horas) se mantienen igual, lo que confirma que la lógica anterior funcionaba bien para casos inmediatos.
3. **Total de ventas sin cambios**: Confirma que no se perdieron ni duplicaron registros.

---

## 🧪 Casos de Prueba Validados

| Test Case | Estado | Resultado |
|-----------|--------|-----------|
| TC-01: Cargar página básica | ✅ PASADO | Página carga correctamente |
| TC-02-04: Validar estados de conciliación | ✅ PASADO | Todos los estados visibles |
| TC-05: Probar infinite scroll | ✅ PASADO | Carga 20 registros iniciales y más al scroll |
| TC-09: Probar filtros | ✅ PASADO | Filtros funcionan correctamente |
| TC-11: Probar filtros en URL | ✅ PASADO | Filtros de fecha en URL funcionan |
| **Mejora de conciliación** | ✅ PASADO | **44.8% → 45.7%** |

---

## 🚀 Próximos Pasos

1. **Monitorear en producción**: Observar si la tasa de conciliación mejora con más datos.
2. **Analizar registros no conciliados**: Investigar los 195 registros "Sin Atención" y 211 "Sin Venta" para identificar patrones.
3. **Considerar ajustes**: Si se identifican patrones específicos, ajustar la ventana de tiempo o la lógica de matching.

---

## 📝 Notas Técnicas

### Compatibilidad

- ✅ **Backward compatible**: La función `isSameDay` se mantiene para otros usos.
- ✅ **Sin breaking changes**: La API del servicio no cambió.
- ✅ **Idempotente**: Múltiples ejecuciones producen el mismo resultado.

### Performance

- ✅ **Sin impacto**: La función `isWithinTimeWindow` es O(1).
- ✅ **Mismo número de queries**: No se agregaron queries adicionales a MongoDB.

---

## 👥 Créditos

**Implementado por**: AI Assistant  
**Revisado por**: Usuario  
**Fecha**: 2026-01-03

