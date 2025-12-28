/**
 * Script para generar un archivo CSV del catálogo de códigos de tratamiento
 */

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFileSync } from "fs";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "sakdental";
const OWNER_ACCOUNT = "MGyL1bJHV1DK";

interface CodeInfo {
  code: string;
  description: string;
  source: "patientsData" | "moneyAccountsData" | "both";
  countPatients: number;
  countMoney: number;
  totalCount: number;
}

async function generateCatalogCSV() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("🔄 Connected to MongoDB\n");

  const db = client.db(MONGODB_DATABASE);
  const patientsCollection = db.collection("patientsData");
  const moneyAccountsCollection = db.collection("moneyAccountsData");

  // Obtener códigos de patientsData (atenciones)
  console.log("🔍 Fetching codes from patientsData...");
  const patientsCodes = await patientsCollection
    .aggregate([
      {
        $match: {
          ownerAccount: OWNER_ACCOUNT,
          recordType: "HealthStory",
          "recordTypeCategory.code": "HSMainSubject",
          "recordTypeSubcategory.code": { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: {
            code: "$recordTypeSubcategory.code",
            description: "$recordTypeSubcategory.description",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          code: "$_id.code",
          description: "$_id.description",
          count: 1,
        },
      },
    ])
    .toArray();

  console.log(`   Found ${patientsCodes.length} unique codes in patientsData\n`);

  // Obtener códigos de moneyAccountsData (ventas)
  console.log("🔍 Fetching codes from moneyAccountsData...");
  const moneyCodes = await moneyAccountsCollection
    .aggregate([
      {
        $match: {
          ownerAccount: OWNER_ACCOUNT,
          "recordTypeCategory.code": "DentalHealthcareServiceItem",
          "recordTypeSubcategory.code": { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: {
            code: "$recordTypeSubcategory.code",
            description: "$recordTypeSubcategory.description",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          code: "$_id.code",
          description: "$_id.description",
          count: 1,
        },
      },
    ])
    .toArray();

  console.log(`   Found ${moneyCodes.length} unique codes in moneyAccountsData\n`);

  // Consolidar códigos
  const codeMap = new Map<string, CodeInfo>();

  // Agregar códigos de patientsData
  for (const item of patientsCodes) {
    const code = item.code as string;
    const description = item.description as string;
    const count = item.count as number;

    codeMap.set(code, {
      code,
      description: description || code,
      source: "patientsData",
      countPatients: count,
      countMoney: 0,
      totalCount: count,
    });
  }

  // Agregar/actualizar códigos de moneyAccountsData
  for (const item of moneyCodes) {
    const code = item.code as string;
    const description = item.description as string;
    const count = item.count as number;

    if (codeMap.has(code)) {
      // Ya existe, actualizar para indicar que está en ambas
      const existing = codeMap.get(code)!;
      existing.source = "both";
      existing.countMoney = count;
      existing.totalCount = existing.countPatients + count;
      // Preferir descripción de patientsData si existe, sino usar la de moneyAccounts
      if (!existing.description || existing.description === existing.code) {
        existing.description = description || code;
      }
    } else {
      // Nuevo código solo en moneyAccountsData
      codeMap.set(code, {
        code,
        description: description || code,
        source: "moneyAccountsData",
        countPatients: 0,
        countMoney: count,
        totalCount: count,
      });
    }
  }

  // Convertir a array y ordenar
  const allCodes = Array.from(codeMap.values()).sort((a, b) =>
    a.code.localeCompare(b.code)
  );

  // Generar CSV (solo Código y Descripción)
  const csvHeader = "Código,Descripción\n";
  const csvRows = allCodes.map((c) => {
    // Escapar comillas y comas en descripciones
    const desc = c.description.replace(/"/g, '""');
    return `"${c.code}","${desc}"`;
  });

  const csvContent = csvHeader + csvRows.join("\n");

  // Guardar archivo
  const outputPath = join(__dirname, "../../treatment-catalog.csv");
  writeFileSync(outputPath, csvContent, "utf-8");

  console.log("📊 RESUMEN:\n");
  console.log(`Total de códigos únicos: ${allCodes.length}`);
  console.log(`Códigos en ambas colecciones: ${allCodes.filter((c) => c.source === "both").length}`);
  console.log(`Códigos solo en patientsData: ${allCodes.filter((c) => c.source === "patientsData").length}`);
  console.log(`Códigos solo en moneyAccountsData: ${allCodes.filter((c) => c.source === "moneyAccountsData").length}`);
  console.log(`\n✅ CSV generado en: ${outputPath}`);

  await client.close();
}

generateCatalogCSV().catch(console.error);

