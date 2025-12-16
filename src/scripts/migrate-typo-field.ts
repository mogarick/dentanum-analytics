#!/usr/bin/env tsx

/**
 * Migration Script: Consolidate recordTypeSubCtegory → recordTypeSubcategory
 * 
 * This script migrates data from the typo field (recordTypeSubCtegory) 
 * to the correct field (recordTypeSubcategory) in moneyAccountsData collection.
 * 
 * Usage:
 *   tsx src/scripts/migrate-typo-field.ts --dry-run    # Preview changes
 *   tsx src/scripts/migrate-typo-field.ts              # Execute migration
 *   tsx src/scripts/migrate-typo-field.ts --remove-typo  # Also remove typo field
 */

// Load environment variables FIRST (before any other imports)
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Get the script's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env.local from multiple locations (script dir, then project root)
config({ path: resolve(__dirname, ".env.local") });
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

// Import MongoDB directly (not the utility that checks env at module load)
import { MongoClient } from "mongodb";

const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "sakdental";
const MONGODB_COLLECTION = "moneyAccountsData";

interface MigrationStats {
  totalRecords: number;
  migrated: number;
  skipped: number;
  errors: number;
  alreadyHasCorrectField: number;
  noTypoField: number;
}

async function migrateTypoField(
  dryRun: boolean = true,
  removeTypoField: boolean = false
): Promise<void> {
  // Get MongoDB URI from environment
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not defined. " +
      "Please create a .env.local file with your MongoDB connection string."
    );
  }

  // Create MongoDB client directly
  const client = new MongoClient(uri, {
    maxPoolSize: 1,
    minPoolSize: 0,
    maxIdleTimeMS: 1000,
  });
  
  await client.connect();
  console.log("🔄 Connected to MongoDB\n");
  
  const db = client.db(MONGODB_DATABASE);
  const collection = db.collection(MONGODB_COLLECTION);

  console.log("🔍 Starting migration analysis...\n");

  // Find all records with typo field
  const recordsWithTypo = await collection
    .find({
      recordTypeSubCtegory: { $ne: null },
    })
    .toArray();

  console.log(`📊 Found ${recordsWithTypo.length} records with typo field\n`);

  const stats: MigrationStats = {
    totalRecords: recordsWithTypo.length,
    migrated: 0,
    skipped: 0,
    errors: 0,
    alreadyHasCorrectField: 0,
    noTypoField: 0,
  };

  // Analyze records
  for (const record of recordsWithTypo) {
    const hasTypo = record.recordTypeSubCtegory != null;
    const hasCorrect = record.recordTypeSubcategory != null;

    if (!hasTypo) {
      stats.noTypoField++;
      continue;
    }

    if (hasCorrect) {
      stats.alreadyHasCorrectField++;
      console.log(
        `⚠️  Record ${record._id} already has both fields - skipping`
      );
      continue;
    }

    // This record needs migration
    if (dryRun) {
      console.log(
        `[DRY RUN] Would migrate: ${record._id} - ${record.recordTypeSubCtegory?.code}`
      );
      stats.migrated++;
    } else {
      try {
        const updateDoc: any = {
          $set: {
            recordTypeSubcategory: {
              code: record.recordTypeSubCtegory.code,
              description: record.recordTypeSubCtegory.description,
            },
          },
        };

        if (removeTypoField) {
          updateDoc.$unset = { recordTypeSubCtegory: "" };
        }

        await collection.updateOne({ _id: record._id }, updateDoc);
        stats.migrated++;
        if (stats.migrated % 100 === 0) {
          console.log(`✅ Migrated ${stats.migrated} records...`);
        }
      } catch (error) {
        stats.errors++;
        console.error(
          `❌ Error migrating record ${record._id}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 MIGRATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total records with typo field: ${stats.totalRecords}`);
  console.log(`✅ Would migrate: ${stats.migrated}`);
  console.log(`⏭️  Already have correct field: ${stats.alreadyHasCorrectField}`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log(`🔍 No typo field (unexpected): ${stats.noTypoField}`);
  console.log("=".repeat(60));

  if (dryRun) {
    console.log("\n💡 This was a DRY RUN - no changes were made");
    console.log("   Run without --dry-run to execute the migration");
  } else {
    console.log("\n✅ Migration completed!");
    if (removeTypoField) {
      console.log("🗑️  Typo field has been removed from migrated records");
    } else {
      console.log("💡 Tip: Use --remove-typo to also remove the typo field");
    }
  }

  await client.close();
  console.log("🔌 MongoDB connection closed");
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes("--execute");
const removeTypoField = args.includes("--remove-typo");

if (dryRun) {
  console.log("🔍 DRY RUN MODE - No changes will be made\n");
}

migrateTypoField(dryRun, removeTypoField)
  .then(() => {
    console.log("\n✨ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });

