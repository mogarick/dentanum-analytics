/**
 * Script para descubrir todos los códigos de tratamiento usados en la BD
 * Consulta patientsData y moneyAccountsData para obtener códigos únicos
 */

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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
  count: number;
}

async function discoverTreatmentCodes() {
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
      { $sort: { code: 1 } },
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
          "recordTypeSubcategory.code": { $exists: true, $ne: null },
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
      { $sort: { code: 1 } },
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
      count,
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
      existing.count += count;
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
        count,
      });
    }
  }

  // Convertir a array y ordenar
  const allCodes = Array.from(codeMap.values()).sort((a, b) =>
    a.code.localeCompare(b.code)
  );

  // Mostrar resultados
  console.log("📊 RESUMEN DE CÓDIGOS ENCONTRADOS:\n");
  console.log(`Total de códigos únicos: ${allCodes.length}\n`);

  console.log("Códigos en ambas colecciones:");
  allCodes
    .filter((c) => c.source === "both")
    .forEach((c) => {
      console.log(`  ✅ ${c.code.padEnd(6)} - ${c.description} (${c.count} registros)`);
    });

  console.log("\nCódigos solo en patientsData (atenciones):");
  allCodes
    .filter((c) => c.source === "patientsData")
    .forEach((c) => {
      console.log(`  ⚠️  ${c.code.padEnd(6)} - ${c.description} (${c.count} registros)`);
    });

  console.log("\nCódigos solo en moneyAccountsData (ventas):");
  allCodes
    .filter((c) => c.source === "moneyAccountsData")
    .forEach((c) => {
      console.log(`  💰 ${c.code.padEnd(6)} - ${c.description} (${c.count} registros)`);
    });

  // Generar objeto TypeScript para el catálogo
  console.log("\n\n📝 OBJETO PARA treatmentCatalog.ts:\n");
  console.log("export const TREATMENT_CATEGORIES: TreatmentCategory[] = [");
  allCodes.forEach((c) => {
    const desc = c.description.replace(/"/g, '\\"');
    console.log(`  { _id: "${c.code}", description: "${desc}" },`);
  });
  console.log("];\n");

  console.log("\n📝 OBJETO TREATMENT_DESCRIPTIONS (versión corta):\n");
  console.log("export const TREATMENT_DESCRIPTIONS: Record<string, string> = {");
  allCodes.forEach((c) => {
    // Generar descripción corta desde la descripción completa
    let shortDesc = c.description;
    // Remover prefijos comunes
    shortDesc = shortDesc.replace(/^Tratamiento \/ Atención de /, "");
    shortDesc = shortDesc.replace(/^Consulta de /, "");
    shortDesc = shortDesc.replace(/^Aclaración de /, "");
    // Si es muy larga, truncar
    if (shortDesc.length > 30) {
      shortDesc = shortDesc.substring(0, 27) + "...";
    }
    console.log(`  ${c.code}: "${shortDesc}",`);
  });
  console.log("};\n");

  await client.close();
  console.log("✅ Done!");
}

discoverTreatmentCodes().catch(console.error);

