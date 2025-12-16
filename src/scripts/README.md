# Migration Scripts

## migrate-typo-field.ts

Migrates data from the typo field `recordTypeSubCtegory` to the correct field `recordTypeSubcategory` in the `moneyAccountsData` collection.

### Background

The `moneyAccountsData` collection has records with a typo in the field name:
- **Typo field**: `recordTypeSubCtegory` (used from 2021-07 to 2024-09-01)
- **Correct field**: `recordTypeSubcategory` (used from 2024-08-04 onwards)

This script consolidates all data into the correct field name.

### Usage

#### 1. Preview changes (Dry Run - Recommended First)
```bash
npm run migrate:typo
# or
tsx src/scripts/migrate-typo-field.ts
```

This will show you:
- How many records will be migrated
- Which records have both fields (will be skipped)
- Any potential issues

#### 2. Execute migration
```bash
npm run migrate:typo:execute
# or
tsx src/scripts/migrate-typo-field.ts --execute
```

This will:
- Copy data from `recordTypeSubCtegory` to `recordTypeSubcategory`
- Keep the typo field (for safety)

#### 3. Execute migration and remove typo field
```bash
npm run migrate:typo:remove
# or
tsx src/scripts/migrate-typo-field.ts --execute --remove-typo
```

This will:
- Copy data from `recordTypeSubCtegory` to `recordTypeSubcategory`
- Remove the typo field after migration

### What Gets Migrated

- Records with `recordTypeSubCtegory` but no `recordTypeSubcategory`
- Approximately **1,790 records** from 2021-07 to 2024-09-01

### Safety Features

- ✅ **Dry-run mode by default** - Preview before executing
- ✅ **Skips records with both fields** - Won't overwrite existing data
- ✅ **Error handling** - Continues on errors, reports at end
- ✅ **Progress reporting** - Shows progress every 100 records
- ✅ **Detailed summary** - Shows exactly what was migrated

### Example Output

```
🔍 DRY RUN MODE - No changes will be made

🔍 Starting migration analysis...

📊 Found 1790 records with typo field

[DRY RUN] Would migrate: tq8Jf4RgTdrT - EXO
[DRY RUN] Would migrate: k8rIHcjM8uPF - END
...

============================================================
📊 MIGRATION SUMMARY
============================================================
Total records with typo field: 1790
✅ Would migrate: 1790
⏭️  Already have correct field: 0
❌ Errors: 0
🔍 No typo field (unexpected): 0
============================================================

💡 This was a DRY RUN - no changes were made
   Run without --dry-run to execute the migration
```

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables (`.env.local`):
   ```bash
   MONGODB_URI=your_connection_string
   MONGODB_DATABASE=sakdental
   ```

### Notes

- The script only migrates records that have the typo field but NOT the correct field
- Records with both fields are skipped (they're already migrated)
- The migration is safe to run multiple times (idempotent)

