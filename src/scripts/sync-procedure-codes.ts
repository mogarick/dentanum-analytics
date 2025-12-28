#!/usr/bin/env tsx

/**
 * Migration Script: Sync Procedure Codes from patientsData to moneyAccountsData
 * 
 * This script synchronizes recordTypeSubcategory codes from patientsData (source of truth)
 * to moneyAccountsData (sales) based on same patient + same day matching.
 * 
 * Usage:
 *   tsx src/scripts/sync-procedure-codes.ts                    # Dry-run (default)
 *   tsx src/scripts/sync-procedure-codes.ts --execute          # Execute migration
 *   tsx src/scripts/sync-procedure-codes.ts --rollback --migration-id=ID  # Rollback
 *   tsx src/scripts/sync-procedure-codes.ts --report           # Show last report
 *   tsx src/scripts/sync-procedure-codes.ts --test-limit=10    # Test with 10 records
 */

// Load environment variables FIRST
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";

// Get the script's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env.local from multiple locations (script dir, then project root)
config({ path: resolve(__dirname, ".env.local") });
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { MongoClient, ObjectId } from "mongodb";
import * as readline from "readline";

const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "sakdental";
const OWNER_ACCOUNT = "MGyL1bJHV1DK";
const MIGRATION_ID = `procedure-code-sync-${new Date().toISOString().split('T')[0]}`;
const REPORTS_DIR = resolve(process.cwd(), "helpers", "migration-reports");

// Ensure reports directory exists
if (!existsSync(REPORTS_DIR)) {
  mkdirSync(REPORTS_DIR, { recursive: true });
}

interface MigrationStats {
  totalProcessed: number;
  updated: number;
  noMatch: number;
  multipleMatches: number;
  alreadySynced: number;
  errors: number;
  byProcedureCode: Record<string, {
    updated: number;
    noMatch: number;
  }>;
}

interface NoMatchRecord {
  _id: string;
  date: string;
  patientId: string | null;
  currentCode: string;
  reason: string;
}

interface MultipleMatchRecord {
  _id: string;
  date: string;
  patientId: string;
  currentCode: string;
  possibleMatches: Array<{
    attentionId: string;
    code: string;
    description: string;
  }>;
}

interface ErrorRecord {
  _id: string;
  error: string;
  timestamp: string;
}

interface MigrationReport {
  migrationId: string;
  timestamp: string;
  mode: 'dry-run' | 'execute';
  summary: MigrationStats;
  noMatchRecords: NoMatchRecord[];
  multipleMatchRecords: MultipleMatchRecord[];
  errors: ErrorRecord[];
}

/**
 * Get same-day date range for MongoDB query
 */
function getSameDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Format date for display (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Prompt user for confirmation
 */
function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Main migration function
 */
async function syncProcedureCodes(
  dryRun: boolean = true,
  testLimit?: number
): Promise<MigrationReport> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not defined. " +
      "Please create a .env.local file with your MongoDB connection string."
    );
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 10000,
  });

  await client.connect();
  console.log("🔄 Connected to MongoDB");
  console.log(`📂 Database: ${MONGODB_DATABASE}`);
  console.log(`👤 Owner Account: ${OWNER_ACCOUNT}\n`);

  const db = client.db(MONGODB_DATABASE);
  const moneyAccountsCollection = db.collection("moneyAccountsData");
  const patientsDataCollection = db.collection("patientsData");
  const personsDataCollection = db.collection("personsData");

  // Initialize stats
  const stats: MigrationStats = {
    totalProcessed: 0,
    updated: 0,
    noMatch: 0,
    multipleMatches: 0,
    alreadySynced: 0,
    errors: 0,
    byProcedureCode: {},
  };

  const noMatchRecords: NoMatchRecord[] = [];
  const multipleMatchRecords: MultipleMatchRecord[] = [];
  const errors: ErrorRecord[] = [];

  console.log("🔍 Fetching sales records from moneyAccountsData...\n");

  // Build query
  const query: any = {
    ownerAccount: OWNER_ACCOUNT,
    "recordTypeCategory.code": "DentalHealthcareServiceItem",
  };

  // Get records to process
  let salesRecords = await moneyAccountsCollection
    .find(query)
    .limit(testLimit || 0)
    .toArray();

  console.log(`📊 Found ${salesRecords.length} sales records to process\n`);

  if (salesRecords.length === 0) {
    console.log("⚠️  No records found to process");
    await client.close();
    return {
      migrationId: MIGRATION_ID,
      timestamp: new Date().toISOString(),
      mode: dryRun ? 'dry-run' : 'execute',
      summary: stats,
      noMatchRecords,
      multipleMatchRecords,
      errors,
    };
  }

  // Show preview of first 5 records
  if (!dryRun) {
    console.log("📋 Preview of first 5 records to be processed:\n");
    for (let i = 0; i < Math.min(5, salesRecords.length); i++) {
      const record = salesRecords[i];
      console.log(`  ${i + 1}. ID: ${record._id}`);
      console.log(`     Date: ${formatDate(new Date(record.date))}`);
      console.log(`     Current Code: ${record.recordTypeSubcategory?.code || 'N/A'}`);
      console.log(`     Subject ID: ${record.subjectId || 'N/A'}\n`);
    }

    // Ask for confirmation
    const confirmed = await askConfirmation(
      `\n⚠️  You are about to modify ${salesRecords.length} records. Continue?`
    );

    if (!confirmed) {
      console.log("\n❌ Migration cancelled by user");
      await client.close();
      process.exit(0);
    }
    console.log("\n");
  }

  // Process each sales record
  for (let i = 0; i < salesRecords.length; i++) {
    const saleRecord = salesRecords[i];
    stats.totalProcessed++;

    try {
      // Log progress every 50 records
      if (stats.totalProcessed % 50 === 0) {
        console.log(`⏳ Processing... ${stats.totalProcessed}/${salesRecords.length}`);
      }

      // Step 1: Get patientId from personsData via subjectId
      let patientId: string | null = null;
      
      if (saleRecord.subjectId) {
        const person = await personsDataCollection.findOne({
          _id: saleRecord.subjectId,
        });

        if (person && person.patientId) {
          patientId = person.patientId;
        }
      }

      if (!patientId) {
        noMatchRecords.push({
          _id: saleRecord._id.toString(),
          date: formatDate(new Date(saleRecord.date)),
          patientId: null,
          currentCode: saleRecord.recordTypeSubcategory?.code || 'N/A',
          reason: 'No patientId found via personsData lookup',
        });
        stats.noMatch++;
        continue;
      }

      // Step 2: Find matching attention in patientsData (same patient + same day)
      const { start, end } = getSameDayRange(new Date(saleRecord.date));

      const matchingAttentions = await patientsDataCollection
        .find({
          ownerAccount: OWNER_ACCOUNT,
          recordType: "HealthcareStory",
          "recordTypeCategory.code": "HSMainSubject",
          _id: { $regex: `^${patientId}_` },
          startDate: {
            $gte: start,
            $lte: end,
          },
        })
        .toArray();

      // Step 3: Handle matching cases
      if (matchingAttentions.length === 0) {
        noMatchRecords.push({
          _id: saleRecord._id.toString(),
          date: formatDate(new Date(saleRecord.date)),
          patientId,
          currentCode: saleRecord.recordTypeSubcategory?.code || 'N/A',
          reason: 'No matching attention found for same patient + same day',
        });
        stats.noMatch++;
        continue;
      }

      if (matchingAttentions.length > 1) {
        multipleMatchRecords.push({
          _id: saleRecord._id.toString(),
          date: formatDate(new Date(saleRecord.date)),
          patientId,
          currentCode: saleRecord.recordTypeSubcategory?.code || 'N/A',
          possibleMatches: matchingAttentions.map((att: any) => ({
            attentionId: att._id,
            code: att.recordTypeSubcategory?.code || 'N/A',
            description: att.recordTypeSubcategory?.description || 'N/A',
          })),
        });
        stats.multipleMatches++;
        continue;
      }

      // Single match found!
      const matchedAttention = matchingAttentions[0];
      const newCode = matchedAttention.recordTypeSubcategory?.code;
      const newDescription = matchedAttention.recordTypeSubcategory?.description;
      const currentCode = saleRecord.recordTypeSubcategory?.code;

      // Check if already synced
      if (currentCode === newCode) {
        stats.alreadySynced++;
        continue;
      }

      // Track by procedure code
      if (!stats.byProcedureCode[newCode]) {
        stats.byProcedureCode[newCode] = { updated: 0, noMatch: 0 };
      }

      if (dryRun) {
        console.log(
          `[DRY RUN] Would update ${saleRecord._id}: ${currentCode} → ${newCode}`
        );
        stats.byProcedureCode[newCode].updated++;
        stats.updated++;
      } else {
        // Execute update with migration log
        await moneyAccountsCollection.updateOne(
          { _id: saleRecord._id },
          {
            $set: {
              "recordTypeSubcategory.code": newCode,
              "recordTypeSubcategory.description": newDescription,
              _migrationLog: {
                migrationId: MIGRATION_ID,
                timestamp: new Date(),
                action: "recordTypeSubcategory-sync",
                previousValues: {
                  code: currentCode,
                  description: saleRecord.recordTypeSubcategory?.description,
                },
                newValues: {
                  code: newCode,
                  description: newDescription,
                },
                sourceAttentionId: matchedAttention._id,
                matchCriteria: {
                  patientId,
                  date: formatDate(new Date(saleRecord.date)),
                },
              },
            },
          }
        );

        stats.byProcedureCode[newCode].updated++;
        stats.updated++;
      }
    } catch (error) {
      stats.errors++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push({
        _id: saleRecord._id.toString(),
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
      console.error(`❌ Error processing ${saleRecord._id}:`, errorMsg);
    }
  }

  // Create report
  const report: MigrationReport = {
    migrationId: MIGRATION_ID,
    timestamp: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'execute',
    summary: stats,
    noMatchRecords,
    multipleMatchRecords,
    errors,
  };

  // Save reports to files
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = resolve(REPORTS_DIR, `migration-report-${timestamp}.json`);
  const noMatchFile = resolve(REPORTS_DIR, `no-match-records-${timestamp}.json`);
  const multiMatchFile = resolve(REPORTS_DIR, `multiple-match-records-${timestamp}.json`);

  writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved: ${reportFile}`);

  if (noMatchRecords.length > 0) {
    writeFileSync(noMatchFile, JSON.stringify(noMatchRecords, null, 2));
    console.log(`📄 No-match records saved: ${noMatchFile}`);
  }

  if (multipleMatchRecords.length > 0) {
    writeFileSync(multiMatchFile, JSON.stringify(multipleMatchRecords, null, 2));
    console.log(`📄 Multiple-match records saved: ${multiMatchFile}`);
  }

  // Print summary
  console.log("\n" + "=".repeat(70));
  console.log("📊 MIGRATION SUMMARY");
  console.log("=".repeat(70));
  console.log(`Migration ID: ${MIGRATION_ID}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`\nTotal processed: ${stats.totalProcessed}`);
  console.log(`✅ Updated: ${stats.updated}`);
  console.log(`✔️  Already synced: ${stats.alreadySynced}`);
  console.log(`⚠️  No match found: ${stats.noMatch}`);
  console.log(`⚠️  Multiple matches: ${stats.multipleMatches}`);
  console.log(`❌ Errors: ${stats.errors}`);

  // Calculate warning threshold
  const noMatchPercentage = (stats.noMatch / stats.totalProcessed) * 100;
  if (noMatchPercentage > 20) {
    console.log(`\n⚠️  WARNING: ${noMatchPercentage.toFixed(1)}% of records have no match!`);
    console.log(`   This is above the 20% threshold. Please review the no-match records.`);
  }

  // Print by procedure code
  if (Object.keys(stats.byProcedureCode).length > 0) {
    console.log("\n📋 By Procedure Code:");
    const sortedCodes = Object.entries(stats.byProcedureCode)
      .sort(([, a], [, b]) => b.updated - a.updated);
    
    for (const [code, counts] of sortedCodes.slice(0, 10)) {
      console.log(`   ${code}: ${counts.updated} updated`);
    }
    
    if (sortedCodes.length > 10) {
      console.log(`   ... and ${sortedCodes.length - 10} more codes`);
    }
  }

  console.log("=".repeat(70));

  if (dryRun) {
    console.log("\n💡 This was a DRY RUN - no changes were made");
    console.log("   Run with --execute to apply the changes");
  } else {
    console.log("\n✅ Migration completed successfully!");
  }

  await client.close();
  console.log("🔌 MongoDB connection closed\n");

  return report;
}

/**
 * Rollback migration
 */
async function rollbackMigration(migrationId: string): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined.");
  }

  const client = new MongoClient(uri);
  await client.connect();
  console.log("🔄 Connected to MongoDB\n");

  const db = client.db(MONGODB_DATABASE);
  const collection = db.collection("moneyAccountsData");

  console.log(`🔍 Looking for records with migration ID: ${migrationId}\n`);

  // Find records with this migration ID
  const recordsToRollback = await collection
    .find({
      "_migrationLog.migrationId": migrationId,
      "_migrationLog.rolledBack": { $ne: true },
    })
    .toArray();

  console.log(`📊 Found ${recordsToRollback.length} records to rollback\n`);

  if (recordsToRollback.length === 0) {
    console.log("⚠️  No records found to rollback");
    await client.close();
    return;
  }

  // Show preview
  console.log("📋 Preview of first 3 records:\n");
  for (let i = 0; i < Math.min(3, recordsToRollback.length); i++) {
    const record = recordsToRollback[i];
    const log = record._migrationLog;
    console.log(`  ${i + 1}. ID: ${record._id}`);
    console.log(`     Current: ${log.newValues.code}`);
    console.log(`     Will restore to: ${log.previousValues.code}\n`);
  }

  // Ask for confirmation
  const confirmed = await askConfirmation(
    `\n⚠️  You are about to rollback ${recordsToRollback.length} records. Continue?`
  );

  if (!confirmed) {
    console.log("\n❌ Rollback cancelled by user");
    await client.close();
    process.exit(0);
  }

  let rolledBack = 0;
  let errors = 0;

  console.log("\n🔄 Rolling back...\n");

  for (const record of recordsToRollback) {
    try {
      const log = record._migrationLog;
      
      await collection.updateOne(
        { _id: record._id },
        {
          $set: {
            "recordTypeSubcategory.code": log.previousValues.code,
            "recordTypeSubcategory.description": log.previousValues.description,
            "_migrationLog.rolledBack": true,
            "_migrationLog.rollbackTimestamp": new Date(),
          },
        }
      );

      rolledBack++;
      
      if (rolledBack % 50 === 0) {
        console.log(`⏳ Rolled back ${rolledBack}/${recordsToRollback.length}...`);
      }
    } catch (error) {
      errors++;
      console.error(
        `❌ Error rolling back ${record._id}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 ROLLBACK SUMMARY");
  console.log("=".repeat(60));
  console.log(`Migration ID: ${migrationId}`);
  console.log(`✅ Rolled back: ${rolledBack}`);
  console.log(`❌ Errors: ${errors}`);
  console.log("=".repeat(60));

  // Save rollback report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const rollbackReport = {
    migrationId,
    timestamp: new Date().toISOString(),
    rolledBack,
    errors,
  };

  const reportFile = resolve(REPORTS_DIR, `rollback-report-${timestamp}.json`);
  writeFileSync(reportFile, JSON.stringify(rollbackReport, null, 2));
  console.log(`\n📄 Rollback report saved: ${reportFile}`);

  await client.close();
  console.log("\n✅ Rollback completed!");
}

/**
 * Show last report
 */
function showLastReport(): void {
  if (!existsSync(REPORTS_DIR)) {
    console.log("⚠️  No reports directory found");
    return;
  }

  const fs = require('fs');
  const reports = fs.readdirSync(REPORTS_DIR)
    .filter((f: string) => f.startsWith('migration-report-'))
    .sort()
    .reverse();

  if (reports.length === 0) {
    console.log("⚠️  No migration reports found");
    return;
  }

  const lastReport = reports[0];
  const reportPath = resolve(REPORTS_DIR, lastReport);
  const report = JSON.parse(readFileSync(reportPath, 'utf-8')) as MigrationReport;

  console.log("\n" + "=".repeat(70));
  console.log("📊 LAST MIGRATION REPORT");
  console.log("=".repeat(70));
  console.log(`Report file: ${lastReport}`);
  console.log(`Migration ID: ${report.migrationId}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Mode: ${report.mode}`);
  console.log(`\nSummary:`);
  console.log(`  Total processed: ${report.summary.totalProcessed}`);
  console.log(`  ✅ Updated: ${report.summary.updated}`);
  console.log(`  ✔️  Already synced: ${report.summary.alreadySynced}`);
  console.log(`  ⚠️  No match: ${report.summary.noMatch}`);
  console.log(`  ⚠️  Multiple matches: ${report.summary.multipleMatches}`);
  console.log(`  ❌ Errors: ${report.summary.errors}`);
  console.log("=".repeat(70) + "\n");
}

// Parse command line arguments
const args = process.argv.slice(2);
const executeMode = args.includes("--execute");
const rollbackMode = args.includes("--rollback");
const showReport = args.includes("--report");
const testLimitArg = args.find(arg => arg.startsWith("--test-limit="));
const testLimit = testLimitArg ? parseInt(testLimitArg.split("=")[1]) : undefined;
const migrationIdArg = args.find(arg => arg.startsWith("--migration-id="));
const migrationId = migrationIdArg ? migrationIdArg.split("=")[1] : undefined;

// Main execution
if (showReport) {
  showLastReport();
  process.exit(0);
}

if (rollbackMode) {
  if (!migrationId) {
    console.error("❌ Error: --migration-id is required for rollback");
    console.log("\nUsage: tsx src/scripts/sync-procedure-codes.ts --rollback --migration-id=YOUR_ID");
    process.exit(1);
  }
  
  rollbackMigration(migrationId)
    .then(() => {
      console.log("\n✨ Rollback completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Rollback failed:", error);
      process.exit(1);
    });
} else {
  const dryRun = !executeMode;
  
  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }
  
  if (testLimit) {
    console.log(`🧪 TEST MODE - Processing only ${testLimit} records\n`);
  }

  syncProcedureCodes(dryRun, testLimit)
    .then(() => {
      console.log("✨ Script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Migration failed:", error);
      process.exit(1);
    });
}

