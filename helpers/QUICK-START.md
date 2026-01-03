# 🚀 Guía Rápida: Script de Sincronización de Códigos

**Tiempo estimado**: 15 minutos para primera ejecución

---

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ Verificar Conexión MongoDB

```bash
# Verificar que .env.local existe y tiene credenciales
cat .env.local

# Debería mostrar:
# MONGODB_URI=mongodb+srv://...
# MONGODB_DATABASE=sakdental
```

**⚠️ Si hay error de conexión SSL** (como el detectado en pruebas):
- Verifica credenciales en MongoDB Atlas
- Agrega tu IP a la whitelist (o usa 0.0.0.0/0 para desarrollo)
- Renueva credenciales si están expiradas

### 2️⃣ Ejecutar Prueba con 10 Registros

```bash
cd /Users/mogarick/code/dentanum/dentanum-analytics
npm run sync:codes:test
```

**✅ Deberías ver**:
```
🧪 TEST MODE - Processing only 10 records
🔄 Connected to MongoDB
📊 Found 10 sales records to process
[DRY RUN] Would update 67abc...: XXX → RES
...
✅ Updated: 8
⚠️  No match found: 2
```

### 3️⃣ Dry Run Completo

```bash
npm run sync:codes
```

**✅ Deberías ver**:
```
======================================================================
📊 MIGRATION SUMMARY
======================================================================
Total processed: 531
✅ Updated: 450
⚠️  No match found: 50  ← Debe ser < 20%
...
💡 This was a DRY RUN - no changes were made
```

---

## 📊 ¿Los Resultados se Ven Bien?

### ✅ Señales Positivas

- Tasa de match > 80% (ej: 450 de 531 = 85%)
- Pocos múltiples matches (< 5%)
- Los códigos más frecuentes tienen sentido (RES, OTD, END, etc.)

### ⚠️ Señales de Advertencia

- Tasa de no-match > 20% → **Investigar antes de ejecutar**
- Muchos múltiples matches > 10% → **Revisar lógica**
- Errores durante el proceso → **Revisar conexión/datos**

---

## 🎯 Ejecutar Migración (si todo OK)

```bash
npm run sync:codes:execute
```

**El script te pedirá confirmación**:
```
📋 Preview of first 5 records to be processed:
  1. ID: 67abc...
     Date: 2024-03-15
     Current Code: XXX
  ...

⚠️  You are about to modify 531 records. Continue? (yes/no):
```

Escribe `yes` y presiona Enter.

**Monitoreo**:
```
⏳ Processing... 50/531
⏳ Processing... 100/531
...
✅ Migration completed successfully!

📄 Full report saved: helpers/migration-reports/migration-report-2024-12-17T10-30-00.json
```

---

## 🔍 Validar Resultados

### En MongoDB

```javascript
// Contar registros migrados
db.moneyAccountsData.countDocuments({
  "_migrationLog.migrationId": "procedure-code-sync-2024-12-17"
})

// Ver un registro de ejemplo
db.moneyAccountsData.findOne({
  "_migrationLog.migrationId": "procedure-code-sync-2024-12-17"
})
```

### En Analytics Dashboard

1. Acceder al dashboard de procedimientos
2. Hacer clic en un procedimiento frecuente (ej: RES)
3. Verificar que ahora aparezcan ventas asociadas (`matchedPayments`)
4. Comparar antes/después: ¿Mejoró el matching?

---

## 🔄 Rollback (si algo sale mal)

```bash
npm run sync:codes:rollback -- --migration-id="procedure-code-sync-2024-12-17"
```

Esto restaurará todos los valores previos.

---

## 📁 Reportes Generados

Todos los reportes se guardan en: `helpers/migration-reports/`

```bash
# Ver último reporte
npm run sync:codes:report

# Ver registros sin match
cat helpers/migration-reports/no-match-records-*.json | jq

# Ver casos ambiguos
cat helpers/migration-reports/multiple-match-records-*.json | jq
```

---

## 🆘 Troubleshooting Rápido

### Error: "MONGODB_URI not defined"
```bash
# Crear .env.local
echo 'MONGODB_URI=tu_connection_string' > .env.local
echo 'MONGODB_DATABASE=sakdental' >> .env.local
```

### Error: SSL/Connection error
- Verifica credenciales en MongoDB Atlas
- Agrega IP a whitelist
- Prueba conexión: `mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')"`

### Alta tasa de no-match (> 20%)
```bash
# Analizar razones
cat helpers/migration-reports/no-match-records-*.json | \
  jq -r '.[].reason' | sort | uniq -c
```

Ver documentación completa: `documentation/sync-procedure-codes-script.md`

---

## 📖 Documentación Completa

| Documento | Para qué |
|-----------|----------|
| **QUICK-START.md** | Esta guía (inicio rápido) |
| **IMPLEMENTATION-SUMMARY.md** | Resumen ejecutivo completo |
| **sync-procedure-codes-script.md** | Guía de usuario exhaustiva (700+ líneas) |
| **src/scripts/README.md** | Documentación técnica |

---

## ✅ Checklist de Primera Ejecución

- [ ] `.env.local` tiene credenciales válidas
- [ ] Conexión a MongoDB funciona (sin error SSL)
- [ ] `npm run sync:codes:test` ejecuta sin errores
- [ ] `npm run sync:codes` muestra tasa de match > 80%
- [ ] Revisaste reportes de no-match y múltiples matches
- [ ] `npm run sync:codes:execute` completó exitosamente
- [ ] Verificaste resultados en MongoDB
- [ ] Probaste drill-down en analytics dashboard
- [ ] `matchedPayments` ahora tiene datos

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu sistema ahora tiene:
- ✅ Códigos de procedimiento sincronizados
- ✅ Drill-down funcional con ventas asociadas
- ✅ Análisis financiero completo por procedimiento
- ✅ Auditoría completa con capacidad de rollback

**🚀 ¡El matching entre atenciones y ventas ahora funciona!**

---

**Comandos para recordar**:
```bash
npm run sync:codes:test      # Probar con 10 registros
npm run sync:codes           # Dry run completo
npm run sync:codes:execute   # Ejecutar migración real
npm run sync:codes:report    # Ver último reporte
npm run sync:codes:rollback  # Revertir cambios
```

**Próximos pasos**: 
1. Resolver conexión MongoDB (si hay error SSL)
2. Ejecutar `npm run sync:codes:test`
3. Seguir esta guía paso a paso

---

**¿Preguntas?** Ver `documentation/sync-procedure-codes-script.md` (FAQs y Troubleshooting completo)









