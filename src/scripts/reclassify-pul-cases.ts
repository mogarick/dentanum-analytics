#!/usr/bin/env tsx

/**
 * Migration Script: Reclassify specific END/RES cases to PUL
 * 
 * This script reclassifies the specific cases identified in the PUL analysis
 * from END/RES to PUL (Problemas Pulpares) in patientsData collection.
 * 
 * Cases to reclassify:
 * 1. P#goFRDRJVHNq-_HS#9kZjCh4j8AMd - END → PUL (2023-05-17)
 * 2. P#hZje-CAhXzmE_HS#79qERwLFWPbk - END → PUL (2024-06-06)
 * 3. P#kBIgw8rDLste_HS#KvWXWy7GJScj - END → PUL (2024-06-06)
 * 4. P#kBIgw8rDLste_HS#m4K4R79ER7qU - END → PUL (2024-05-30)
 * 5. P#JTVaKH97Zjw9_HS#UVSxMKV1hz_W - RES → PUL (2023-08-15)
 * 
 * Usage:
 *   tsx src/scripts/reclassify-pul-cases.ts --dry-run    # Preview changes
 *   tsx src/scripts/reclassify-pul-cases.ts --execute     # Execute migration
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

// Import MongoDB directly
import { MongoClient } from "mongodb";

const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "sakdental";
const MONGODB_COLLECTION = "patientsData";

// Specific cases to reclassify (from PUL analysis)
const CASES_TO_RECLASSIFY = [
  "P#goFRDRJVHNq-_HS#9kZjCh4j8AMd", // END → PUL (2023-05-17)
  "P#hZje-CAhXzmE_HS#79qERwLFWPbk", // END → PUL (2024-06-06)
  "P#kBIgw8rDLste_HS#KvWXWy7GJScj", // END → PUL (2024-06-06)
  "P#kBIgw8rDLste_HS#m4K4R79ER7qU", // END → PUL (2024-05-30)
  "P#JTVaKH97Zjw9_HS#UVSxMKV1hz_W", // RES → PUL (2023-08-15)
];

interface MigrationStats {
  totalCases: number;
  found: number;
  updated: number;
  notFound: number;
  errors: number;
  alreadyPUL: number;
}

async function reclassifyPULCases(dryRun: boolean = true): Promise<void> {
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

  console.log("🔍 Starting reclassification analysis...\n");
  console.log(`📋 Cases to reclassify: ${CASES_TO_RECLASSIFY.length}\n`);

  const stats: MigrationStats = {
    totalCases: CASES_TO_RECLASSIFY.length,
    found: 0,
    updated: 0,
    notFound: 0,
    errors: 0,
    alreadyPUL: 0,
  };

  // Process each case
  for (const caseId of CASES_TO_RECLASSIFY) {
    try {
      const record = await collection.findOne({ _id: caseId });

      if (!record) {
        stats.notFound++;
        console.log(`❌ Not found: ${caseId}`);
        continue;
      }

      stats.found++;

      const currentCode = record.recordTypeSubcategory?.code;
      const currentDescription = record.recordTypeSubcategory?.description;

      // Check if already PUL
      if (currentCode === "PUL") {
        stats.alreadyPUL++;
        console.log(`✅ Already PUL: ${caseId} (${record.name || "N/A"})`);
        continue;
      }

      // Show what will be changed
      console.log(`\n📝 Case: ${caseId}`);
      console.log(`   Name: ${record.name || "N/A"}`);
      console.log(`   Date: ${record.startDate ? new Date(record.startDate).toISOString().split('T')[0] : "N/A"}`);
      console.log(`   Current: ${currentCode} - ${currentDescription || "N/A"}`);
      console.log(`   → Will change to: PUL - Problemas Pulpares`);

      if (dryRun) {
        stats.updated++;
        console.log(`   [DRY RUN] Would update to PUL`);
      } else {
        // Update to PUL
        await collection.updateOne(
          { _id: caseId },
          {
            $set: {
              "recordTypeSubcategory.code": "PUL",
              "recordTypeSubcategory.description": "Problemas Pulpares",
            },
          }
        );
        stats.updated++;
        console.log(`   ✅ Updated to PUL`);
      }
    } catch (error) {
      stats.errors++;
      console.error(
        `❌ Error processing case ${caseId}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 RECLASSIFICATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total cases to reclassify: ${stats.totalCases}`);
  console.log(`✅ Found in database: ${stats.found}`);
  console.log(`🔄 Would update: ${stats.updated}`);
  console.log(`✅ Already PUL: ${stats.alreadyPUL}`);
  console.log(`❌ Not found: ${stats.notFound}`);
  console.log(`⚠️  Errors: ${stats.errors}`);
  console.log("=".repeat(60));

  if (dryRun) {
    console.log("\n💡 This was a DRY RUN - no changes were made");
    console.log("   Run with --execute to apply the changes");
  } else {
    console.log("\n✅ Reclassification completed!");
  }

  await client.close();
  console.log("🔌 MongoDB connection closed");
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes("--execute");

if (dryRun) {
  console.log("🔍 DRY RUN MODE - No changes will be made\n");
}

reclassifyPULCases(dryRun)
  .then(() => {
    console.log("\n✨ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Reclassification failed:", error);
    process.exit(1);
  });

