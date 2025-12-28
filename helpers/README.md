# 📁 Helpers Directory

Este directorio contiene archivos auxiliares, reportes de migración y documentación de soporte.

---

## 📂 Contenido

### 📄 Documentación

| Archivo | Descripción | Audiencia |
|---------|-------------|-----------|
| **QUICK-START.md** | Guía rápida de inicio (15 min) | Todos |
| **IMPLEMENTATION-SUMMARY.md** | Resumen ejecutivo completo | Stakeholders |
| **pul-analysis.md** | Análisis de casos PUL | Equipo |

### 📊 Reportes de Migración

Ubicación: `migration-reports/`

Los reportes se generan automáticamente al ejecutar el script de sincronización:

```
migration-reports/
├── migration-report-{timestamp}.json         # Reporte completo
├── no-match-records-{timestamp}.json         # Registros sin match
├── multiple-match-records-{timestamp}.json   # Casos ambiguos
└── rollback-report-{timestamp}.json          # Detalles de rollback
```

**Nota**: Esta carpeta se crea automáticamente al ejecutar el script por primera vez.

---

## 🚀 Scripts de Migración

### Sincronización de Códigos de Procedimientos

**Problema**: Códigos inconsistentes entre `patientsData` y `moneyAccountsData`  
**Solución**: Script que sincroniza códigos basándose en matching de paciente + día

#### Comandos Principales

```bash
# 1. Probar con 10 registros
npm run sync:codes:test

# 2. Vista previa completa (sin cambios)
npm run sync:codes

# 3. Ejecutar migración real
npm run sync:codes:execute

# 4. Ver último reporte
npm run sync:codes:report

# 5. Revertir cambios
npm run sync:codes:rollback -- --migration-id="procedure-code-sync-2024-12-17"
```

#### Documentación Completa

- **Inicio Rápido**: `QUICK-START.md` (esta carpeta)
- **Guía Completa**: `../documentation/sync-procedure-codes-script.md`
- **Código Fuente**: `../src/scripts/sync-procedure-codes.ts`
- **Documentación Técnica**: `../src/scripts/README.md`

---

## 📈 Estado de Migraciones

### Última Migración

```bash
# Ver detalles de la última migración ejecutada
npm run sync:codes:report
```

### Historial de Migraciones

Todos los reportes se guardan en `migration-reports/` con timestamp.

Para ver el historial:
```bash
ls -lh migration-reports/
```

---

## 🔍 Análisis de Reportes

### Ver Resumen

```bash
# Último reporte completo
cat migration-reports/migration-report-*.json | jq '.summary'

# Tasa de match
cat migration-reports/migration-report-*.json | jq '.summary | 
  {
    total: .totalProcessed, 
    updated: .updated, 
    matchRate: ((.updated / .totalProcessed) * 100)
  }'
```

### Analizar No-Match

```bash
# Contar razones de no-match
cat migration-reports/no-match-records-*.json | \
  jq -r '.[].reason' | sort | uniq -c

# Ver distribución por fecha
cat migration-reports/no-match-records-*.json | \
  jq -r '.[].date' | cut -d'-' -f1-2 | sort | uniq -c

# Exportar a CSV para análisis en Excel
cat migration-reports/no-match-records-*.json | \
  jq -r '.[] | [._id, .date, .patientId, .currentCode, .reason] | @csv' \
  > no-match-analysis.csv
```

### Analizar Múltiples Matches

```bash
# Ver cantidad de matches por registro
cat migration-reports/multiple-match-records-*.json | \
  jq '.[] | {id: ._id, matchCount: (.possibleMatches | length)}'

# Ver si son códigos iguales o diferentes
cat migration-reports/multiple-match-records-*.json | \
  jq '.[] | {id: ._id, uniqueCodes: ([.possibleMatches[].code] | unique)}'
```

---

## 🗂️ Estructura de Archivos

```
helpers/
├── README.md                              # Este archivo
├── QUICK-START.md                         # Guía rápida (15 min)
├── IMPLEMENTATION-SUMMARY.md              # Resumen ejecutivo
├── pul-analysis.md                        # Análisis PUL
└── migration-reports/                     # Reportes automáticos
    ├── migration-report-2024-12-17T10-30-00.json
    ├── no-match-records-2024-12-17T10-30-00.json
    ├── multiple-match-records-2024-12-17T10-30-00.json
    └── rollback-report-2024-12-17T14-00-00.json
```

---

## 🔄 Workflow Recomendado

### Primera Ejecución

1. **Leer**: `QUICK-START.md`
2. **Probar**: `npm run sync:codes:test`
3. **Preview**: `npm run sync:codes`
4. **Analizar reportes**: Revisar `migration-reports/`
5. **Ejecutar**: `npm run sync:codes:execute` (si todo OK)
6. **Validar**: Verificar en MongoDB y Analytics Dashboard

### Ejecuciones Posteriores

```bash
# El script omitirá registros ya sincronizados
npm run sync:codes:execute

# Ver qué cambió
npm run sync:codes:report
```

---

## 📊 Métricas de Éxito

### Indicadores Clave

| Métrica | Objetivo | Cómo Medir |
|---------|----------|-----------|
| **Match Rate** | > 80% | `summary.updated / summary.totalProcessed` |
| **No Match** | < 20% | `summary.noMatch / summary.totalProcessed` |
| **Múltiples Matches** | < 5% | `summary.multipleMatches / summary.totalProcessed` |
| **Errores** | 0% | `summary.errors` |

### Dashboard de Impacto

**Antes de migración**:
- Drill-down sin ventas asociadas
- `matchedPayments` vacíos
- Análisis financiero incompleto

**Después de migración**:
- Drill-down con ventas correlacionadas
- `matchedPayments` poblados (> 80%)
- Análisis financiero completo por procedimiento

---

## 🆘 Soporte

### Problemas Comunes

| Problema | Solución Rápida | Documentación |
|----------|-----------------|---------------|
| Error SSL MongoDB | Verificar credenciales y whitelist | `QUICK-START.md` |
| Alta tasa no-match | Analizar reportes, investigar datos | `sync-procedure-codes-script.md` |
| Necesito rollback | `npm run sync:codes:rollback` | Ver documentación completa |
| ¿Cómo leo reportes? | Ver sección "Análisis de Reportes" | Este archivo |

### Documentación Adicional

- **FAQs**: `../documentation/sync-procedure-codes-script.md` (sección FAQs)
- **Troubleshooting**: `../documentation/sync-procedure-codes-script.md` (sección Troubleshooting)
- **Casos de Uso**: `../documentation/sync-procedure-codes-script.md` (sección Casos de Uso)

---

## 📞 Contacto

**¿Preguntas sobre el script?**
- Revisar documentación completa en `/documentation/`
- Ver código fuente comentado en `/src/scripts/sync-procedure-codes.ts`
- Consultar FAQs y Troubleshooting

**¿Encontraste un bug?**
- Revisar logs en terminal
- Consultar `migration-reports/` para detalles
- Ver sección de errores en reporte principal

---

## 🎯 Próximos Pasos

### Inmediato (Hoy)

1. [ ] Verificar conexión MongoDB (resolver error SSL si existe)
2. [ ] Ejecutar `npm run sync:codes:test`
3. [ ] Revisar resultados del test
4. [ ] Ejecutar `npm run sync:codes` (dry run completo)
5. [ ] Analizar reportes generados

### Corto Plazo (Esta Semana)

1. [ ] Ejecutar `npm run sync:codes:execute` (si dry run OK)
2. [ ] Validar resultados en MongoDB
3. [ ] Probar drill-down en analytics dashboard
4. [ ] Documentar lecciones aprendidas

### Mediano Plazo (Próximas Semanas)

1. [ ] Implementar sincronización automática en aplicación (opcional)
2. [ ] Crear proceso periódico para nuevos registros (opcional)
3. [ ] Optimizar queries si hay problemas de performance (opcional)

---

## 📚 Recursos

### Scripts Disponibles

```bash
# Ver todos los scripts de migración
npm run | grep sync
npm run | grep migrate
npm run | grep reclassify
```

### Archivos Importantes

```
dentanum-analytics/
├── src/scripts/
│   ├── sync-procedure-codes.ts           # Script principal (780 líneas)
│   ├── migrate-typo-field.ts             # Script de migración de typo
│   └── README.md                          # Documentación técnica
├── documentation/
│   ├── sync-procedure-codes-script.md    # Guía completa (700+ líneas)
│   └── procedure-drill-down-implementation-plan.md
└── helpers/
    ├── README.md                          # Este archivo
    ├── QUICK-START.md                     # Guía rápida
    ├── IMPLEMENTATION-SUMMARY.md          # Resumen ejecutivo
    └── migration-reports/                 # Reportes automáticos
```

---

**📅 Última actualización**: 2024-12-17  
**✅ Estado**: Implementación completa  
**🚀 Próximo paso**: Ejecutar `npm run sync:codes:test`






