# Migration Scripts

## sync-procedure-codes.ts

Synchronizes `recordTypeSubcategory` codes from `patientsData` (source of truth) to `moneyAccountsData` (sales) based on same patient + same day matching.

### Background

The `moneyAccountsData` collection contains sales records that may have incorrect procedure codes in `recordTypeSubcategory.code`. The correct codes are stored in `patientsData` (attentions/health stories). This script matches sales with attentions based on:
- Same patient (via `personsData` lookup)
- Same day (comparing dates)

### Workflow

1. **For each sale in `moneyAccountsData`**:
   - Get `patientId` via lookup: `subjectId` → `personsData._id` → `personsData.patientId`
   - Find matching attention in `patientsData` (same patient + same day)
   - Update `recordTypeSubcategory` to match the attention
   - Add `_migrationLog` subdocument for auditing

2. **Matching criteria**:
   - Same `patientId`
   - Same date (year-month-day, ignoring time)
   - Attention filters: `recordType: "HealthStory"`, `recordTypeCategory.code: "HSMainSubject"`

### Usage

#### 1. Dry Run (Recommended First)
```bash
npm run sync:codes
# or
tsx src/scripts/sync-procedure-codes.ts
```

Shows preview without making changes:
- How many records will be updated
- How many have no match or multiple matches
- First 5 records to be modified

#### 2. Test with Small Dataset
```bash
npm run sync:codes:test
# or
tsx src/scripts/sync-procedure-codes.ts --test-limit=10
```

Process only 10 records to validate logic before full run.

#### 3. Execute Migration
```bash
npm run sync:codes:execute
# or
tsx src/scripts/sync-procedure-codes.ts --execute
```

Executes the migration:
- Prompts for confirmation before starting
- Shows warning if > 20% records have no match
- Updates codes and descriptions
- Adds migration log to each record

#### 4. View Last Report
```bash
npm run sync:codes:report
# or
tsx src/scripts/sync-procedure-codes.ts --report
```

Shows summary of the last migration run.

#### 5. Rollback Migration
```bash
npm run sync:codes:rollback -- --migration-id="procedure-code-sync-2024-12-17"
# or
tsx src/scripts/sync-procedure-codes.ts --rollback --migration-id="procedure-code-sync-2024-12-17"
```

Rolls back a specific migration:
- Restores previous values from `_migrationLog.previousValues`
- Marks records as rolled back with timestamp
- Generates rollback report

### Migration Log Structure

Each updated record gets a `_migrationLog` subdocument:

```javascript
{
  _migrationLog: {
    migrationId: "procedure-code-sync-2024-12-17",
    timestamp: ISODate("2024-12-17T10:30:00Z"),
    action: "recordTypeSubcategory-sync",
    previousValues: {
      code: "XXX",
      description: "Previous description"
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
    // Added if rolled back:
    rolledBack: true,
    rollbackTimestamp: ISODate("2024-12-17T12:00:00Z")
  }
}
```

### Generated Reports

All reports are saved in `helpers/migration-reports/`:

1. **`migration-report-{timestamp}.json`**: Complete migration report
   - Summary statistics
   - By-procedure-code breakdown
   - Full details of all outcomes

2. **`no-match-records-{timestamp}.json`**: Records without matching attention
   - Requires manual review
   - Includes reason for no match

3. **`multiple-match-records-{timestamp}.json`**: Records with ambiguous matches
   - Multiple attentions found for same patient + day
   - Requires manual review to select correct match

4. **`rollback-report-{timestamp}.json`**: Rollback execution summary

### Special Cases

- **No match**: Record not updated, logged in no-match report
- **Multiple matches**: Record not updated, logged in multiple-match report
- **Already synced**: Record skipped (code already correct)
- **Error during processing**: Record skipped, logged in errors array

### Safety Features

- ✅ **Dry-run by default** - Must explicitly use `--execute`
- ✅ **Confirmation prompt** - Preview + user confirmation before execution
- ✅ **Test mode** - Test with `--test-limit` before full run
- ✅ **Complete audit trail** - Every change tracked in `_migrationLog`
- ✅ **Rollback capability** - Restore previous values anytime
- ✅ **Detailed reports** - JSON files for all outcomes
- ✅ **Warning threshold** - Alerts if > 20% records have no match
- ✅ **Error handling** - Continues on errors, reports at end

### Example Output

```
🔍 DRY RUN MODE - No changes will be made

🔄 Connected to MongoDB
📂 Database: sakdental
👤 Owner Account: MGyL1bJHV1DK

🔍 Fetching sales records from moneyAccountsData...

📊 Found 531 sales records to process

⏳ Processing... 50/531
⏳ Processing... 100/531
...

📄 Full report saved: helpers/migration-reports/migration-report-2024-12-17T10-30-00.json
📄 No-match records saved: helpers/migration-reports/no-match-records-2024-12-17T10-30-00.json

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
   EXO: 30 updated
   PER: 20 updated
   ... and 5 more codes
======================================================================

💡 This was a DRY RUN - no changes were made
   Run with --execute to apply the changes
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

- Script only processes `ownerAccount: "MGyL1bJHV1DK"` and `DentalHealthcareServiceItem` records
- Date matching is day-level (ignores time component)
- Records with already-correct codes are skipped
- Migration is idempotent (safe to run multiple times)
- Each migration gets a unique ID with date

---

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

