import { getMongoClient } from "../utils/mongodb.server";
import { extractPatientId, anonymizePatientId, calculateAge } from "../utils/patientUtils";
import { formatTime, calculateTimeDifference, isSameDay } from "../utils/dateUtils";
import type {
  ProcedureDetailFilters,
  AttentionRecord,
  SaleRecord,
  ConsolidatedRecord,
  ConciliationStatus,
  ConciliationStats,
  ConsolidatedResponse,
} from "../types/procedureDetail.types";

const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "sakdental";
const OWNER_ACCOUNT = "MGyL1bJHV1DK";

/**
 * Construye el filtro de fecha basado en year, month, day
 */
function buildDateFilter(year?: string, month?: string, day?: string): Record<string, unknown> {
  if (!year) return {};

  const yearNum = parseInt(year, 10);
  
  if (day && month) {
    // Filtrar por día específico
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    const startDate = new Date(yearNum, monthNum - 1, dayNum, 0, 0, 0);
    const endDate = new Date(yearNum, monthNum - 1, dayNum, 23, 59, 59);
    
    return {
      $gte: startDate,
      $lte: endDate,
    };
  } else if (month) {
    // Filtrar por mes específico
    const monthNum = parseInt(month, 10);
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);
    
    return {
      $gte: startDate,
      $lte: endDate,
    };
  } else {
    // Filtrar por año específico
    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59);
    
    return {
      $gte: startDate,
      $lte: endDate,
    };
  }
}

/**
 * Obtiene las atenciones (patientsData) filtradas
 */
export async function getAttentions(filters: ProcedureDetailFilters): Promise<AttentionRecord[]> {
  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DATABASE);
    const patientsCollection = db.collection("patientsData");
    const personsCollection = db.collection("personsData");

    console.log("🔍 Fetching attentions with filters:", filters);

    // Construir match
    const matchStage: Record<string, unknown> = {
      ownerAccount: OWNER_ACCOUNT,
      recordType: "HealthStory",
      "recordTypeCategory.code": "HSMainSubject",
      "recordTypeSubcategory.code": filters.procedureCode,
      startDate: { $ne: null },
    };

    // Aplicar filtro de fecha
    const dateFilter = buildDateFilter(filters.year, filters.month, filters.day);
    if (Object.keys(dateFilter).length > 0) {
      matchStage.startDate = dateFilter;
    }

    // Aggregation pipeline
    const results = await patientsCollection
      .aggregate([
        { $match: matchStage },
        {
          $addFields: {
            patientId: {
              $arrayElemAt: [{ $split: ["$_id", "_"] }, 0],
            },
          },
        },
        {
          $lookup: {
            from: "personsData",
            localField: "patientId",
            foreignField: "patientId",
            as: "personInfo",
          },
        },
        {
          $addFields: {
            birthdate: {
              $arrayElemAt: ["$personInfo.birthdate", 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            startDate: 1,
            "recordTypeSubcategory.code": 1,
            "recordTypeSubcategory.description": 1,
            name: 1,
            note: 1,
            patientId: 1,
            birthdate: 1,
          },
        },
        { $sort: { startDate: -1 } },
      ])
      .toArray();

    console.log(`✅ Found ${results.length} attentions`);

    // Transformar a AttentionRecord
    const attentions: AttentionRecord[] = results.map((doc) => ({
      _id: doc._id as string,
      startDate: doc.startDate,
      procedureCode: doc.recordTypeSubcategory?.code || filters.procedureCode,
      procedureDescription: doc.recordTypeSubcategory?.description || "",
      reason: doc.name || "",
      note: doc.note || "",
      patientId: doc.patientId as string,
      patientAge: calculateAge(doc.birthdate),
    }));

    return attentions;
  } catch (error) {
    console.error("❌ Error fetching attentions:", error);
    throw new Error(
      `Failed to fetch attentions: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Obtiene las ventas (moneyAccountsData) filtradas
 */
export async function getSales(filters: ProcedureDetailFilters): Promise<SaleRecord[]> {
  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DATABASE);
    const moneyAccountsCollection = db.collection("moneyAccountsData");
    const personsCollection = db.collection("personsData");

    console.log("🔍 Fetching sales with filters:", filters);

    // Construir match
    const matchStage: Record<string, unknown> = {
      ownerAccount: OWNER_ACCOUNT,
      "recordTypeCategory.code": "DentalHealthcareServiceItem",
      "recordTypeSubcategory.code": filters.procedureCode,
      date: { $ne: null },
    };

    // Aplicar filtro de fecha
    const dateFilter = buildDateFilter(filters.year, filters.month, filters.day);
    if (Object.keys(dateFilter).length > 0) {
      matchStage.date = dateFilter;
    }

    // Aggregation pipeline
    const results = await moneyAccountsCollection
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "personsData",
            localField: "subjectId",
            foreignField: "_id", // subjectId apunta a personsData._id
            as: "personInfo",
          },
        },
        {
          $addFields: {
            // Extraer patientId y birthdate de personsData
            patientId: {
              $arrayElemAt: ["$personInfo.patientId", 0],
            },
            birthdate: {
              $arrayElemAt: ["$personInfo.birthdate", 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            date: 1,
            "recordTypeSubcategory.code": 1,
            "recordTypeSubcategory.description": 1,
            value: 1,
            patientId: 1, // Ahora es el patientId real de personsData
            birthdate: 1,
          },
        },
        { $sort: { date: -1 } },
      ])
      .toArray();

    console.log(`✅ Found ${results.length} sales`);

    // Transformar a SaleRecord
    const sales: SaleRecord[] = results.map((doc) => ({
      _id: doc._id as string,
      date: doc.date,
      procedureCode: doc.recordTypeSubcategory?.code || filters.procedureCode,
      procedureDescription: doc.recordTypeSubcategory?.description || "",
      amount: Math.abs(doc.value || 0),
      patientId: doc.patientId as string, // patientId real de personsData
      patientAge: calculateAge(doc.birthdate),
    }));

    return sales;
  } catch (error) {
    console.error("❌ Error fetching sales:", error);
    throw new Error(
      `Failed to fetch sales: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Determina el estado de conciliación basado en la diferencia de tiempo
 */
function determineConciliationStatus(
  hasAttention: boolean,
  hasSale: boolean,
  timeDiffMinutes?: number
): ConciliationStatus {
  if (!hasAttention) return "sale-only";
  if (!hasSale) return "attention-only";
  
  // Ambos existen
  if (timeDiffMinutes === undefined) return "likely-match";
  
  const threeHoursInMinutes = 3 * 60;
  if (timeDiffMinutes <= threeHoursInMinutes) {
    return "perfect-match";
  }
  
  return "likely-match";
}

/**
 * Consolida atenciones y ventas en registros unificados
 */
export function consolidateRecords(
  attentions: AttentionRecord[],
  sales: SaleRecord[]
): ConsolidatedRecord[] {
  const consolidated: ConsolidatedRecord[] = [];
  const matchedSaleIds = new Set<string>();

  // Para cada atención, buscar venta coincidente
  for (const attention of attentions) {
    const attentionDate = new Date(attention.startDate);
    
    // Buscar venta del mismo paciente en el mismo día
    const matchingSale = sales.find((sale) => {
      if (matchedSaleIds.has(sale._id)) return false;
      
      const samePatient = sale.patientId === attention.patientId;
      const sameDay = isSameDay(sale.date, attention.startDate);
      
      return samePatient && sameDay;
    });

    if (matchingSale) {
      matchedSaleIds.add(matchingSale._id);
      
      const timeDiff = calculateTimeDifference(attention.startDate, matchingSale.date);
      const status = determineConciliationStatus(true, true, timeDiff);

      consolidated.push({
        id: `${attention._id}_${matchingSale._id}`,
        patientId: anonymizePatientId(attention.patientId),
        patientAge: attention.patientAge,
        date: attentionDate,
        attention: {
          _id: attention._id,
          time: formatTime(attention.startDate),
          procedureCode: attention.procedureCode,
          procedureDescription: attention.procedureDescription,
          reason: attention.reason,
          note: attention.note,
        },
        sale: {
          _id: matchingSale._id,
          time: formatTime(matchingSale.date),
          procedureCode: matchingSale.procedureCode,
          procedureDescription: matchingSale.procedureDescription,
          amount: matchingSale.amount,
        },
        conciliationStatus: status,
        timeDifferenceMinutes: timeDiff,
      });
    } else {
      // Atención sin venta
      consolidated.push({
        id: attention._id,
        patientId: anonymizePatientId(attention.patientId),
        patientAge: attention.patientAge,
        date: attentionDate,
        attention: {
          _id: attention._id,
          time: formatTime(attention.startDate),
          procedureCode: attention.procedureCode,
          procedureDescription: attention.procedureDescription,
          reason: attention.reason,
          note: attention.note,
        },
        conciliationStatus: "attention-only",
      });
    }
  }

  // Agregar ventas sin atención
  for (const sale of sales) {
    if (!matchedSaleIds.has(sale._id)) {
      const saleDate = new Date(sale.date);
      
      consolidated.push({
        id: sale._id,
        patientId: anonymizePatientId(sale.patientId),
        patientAge: sale.patientAge,
        date: saleDate,
        sale: {
          _id: sale._id,
          time: formatTime(sale.date),
          procedureCode: sale.procedureCode,
          procedureDescription: sale.procedureDescription,
          amount: sale.amount,
        },
        conciliationStatus: "sale-only",
      });
    }
  }

  // Ordenar por fecha descendente
  consolidated.sort((a, b) => b.date.getTime() - a.date.getTime());

  return consolidated;
}

/**
 * Calcula estadísticas de conciliación
 */
export function calculateStats(records: ConsolidatedRecord[]): ConciliationStats {
  const totalRecords = records.length;
  
  const perfectMatches = records.filter((r) => r.conciliationStatus === "perfect-match").length;
  const likelyMatches = records.filter((r) => r.conciliationStatus === "likely-match").length;
  const attentionOnly = records.filter((r) => r.conciliationStatus === "attention-only").length;
  const saleOnly = records.filter((r) => r.conciliationStatus === "sale-only").length;

  const totalMatched = perfectMatches + likelyMatches;
  const conciliationRate = totalRecords > 0 ? (totalMatched / totalRecords) * 100 : 0;

  // Calcular total de ventas
  const totalSalesAmount = records.reduce((sum, record) => {
    return sum + (record.sale?.amount || 0);
  }, 0);

  // Promedio de venta (solo donde hay venta)
  const recordsWithSale = records.filter((r) => r.sale !== undefined);
  const avgSaleAmount = recordsWithSale.length > 0 ? totalSalesAmount / recordsWithSale.length : 0;

  // Promedio de diferencia de tiempo (solo perfect y likely matches)
  const matchedRecords = records.filter(
    (r) => r.timeDifferenceMinutes !== undefined
  );
  const avgTimeDiff =
    matchedRecords.length > 0
      ? matchedRecords.reduce((sum, r) => sum + (r.timeDifferenceMinutes || 0), 0) /
        matchedRecords.length
      : 0;

  return {
    totalRecords,
    perfectMatches,
    likelyMatches,
    attentionOnly,
    saleOnly,
    conciliationRate,
    totalSalesAmount,
    avgSaleAmount,
    avgTimeDifferenceMinutes: avgTimeDiff,
  };
}

/**
 * Obtiene registros consolidados con paginación
 */
export async function getConsolidatedRecords(
  filters: ProcedureDetailFilters,
  page = 1,
  limit = 20
): Promise<ConsolidatedResponse> {
  try {
    console.log("🚀 Starting getConsolidatedRecords", { filters, page, limit });

    // Obtener atenciones y ventas en paralelo
    const [attentions, sales] = await Promise.all([
      getAttentions(filters),
      getSales(filters),
    ]);

    console.log(`📊 Found ${attentions.length} attentions and ${sales.length} sales`);

    // Consolidar
    const allRecords = consolidateRecords(attentions, sales);
    console.log(`🔗 Consolidated into ${allRecords.length} records`);

    // Calcular stats sobre todos los registros
    const stats = calculateStats(allRecords);

    // Aplicar paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const records = allRecords.slice(startIndex, endIndex);

    const hasMore = endIndex < allRecords.length;

    console.log(`✅ Returning page ${page} with ${records.length} records (hasMore: ${hasMore})`);

    return {
      records,
      stats,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalRecords: allRecords.length,
        hasMore,
      },
    };
  } catch (error) {
    console.error("❌ Error in getConsolidatedRecords:", error);
    throw error;
  }
}

