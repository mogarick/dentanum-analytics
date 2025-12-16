import { getMongoClient } from "../utils/mongodb.server";
import type {
  TreatmentData,
  TreatmentDataMongoResponse,
} from "../types/treatmentData.types";

const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "sakdental";
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || "patientsData";

export async function getTreatmentDataByMonth(): Promise<TreatmentData[]> {
  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection(MONGODB_COLLECTION);

    console.log(
      `🔍 Fetching treatment data from ${MONGODB_DATABASE}.${MONGODB_COLLECTION}`
    );

    // Agregación de MongoDB según el documento de especificaciones
    const results = await collection
      .aggregate<TreatmentDataMongoResponse>(
        [
          {
            $match: {
              startDate: { $ne: null },
              recordTypeSubcategory: { $ne: null },
              ownerAccount: "MGyL1bJHV1DK",
            },
          },
          {
            $addFields: {
              year: { $year: "$startDate" },
              month: { $month: "$startDate" },
              yearMonth: {
                $dateToString: {
                  date: "$startDate",
                  format: "%Y-%m",
                },
              },
            },
          },
          {
            $group: {
              _id: {
                yearMonth: "$yearMonth",
                year: "$year",
                month: "$month",
                treatmentCode: "$recordTypeSubcategory.code",
                treatmentDescription: "$recordTypeSubcategory.description",
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: {
              "_id.yearMonth": 1,
              "_id.treatmentCode": 1,
            },
          },
        ],
        {
          allowDiskUse: true,
          maxTimeMS: 30000,
          // Force fresh execution, disable query plan caching
          hint: { _id: 1 },
        }
      )
      .toArray();

    // Transformar al formato esperado por el componente (eliminar campos extra)
    const transformedData: TreatmentData[] = results.map((item) => ({
      _id: {
        yearMonth: item._id.yearMonth,
        treatmentCode: item._id.treatmentCode,
      },
      count: item.count,
    }));

    console.log(
      `✅ Loaded ${transformedData.length} treatment records from MongoDB`
    );
    console.log("🔍 Sample transformed data:", transformedData.slice(0, 3));
    console.log("🔍 Raw aggregation sample:", results.slice(0, 3));

    // Count verification for March 2023
    const march2023 = transformedData.filter(
      (item) => item._id.yearMonth === "2023-03"
    );
    console.log(
      "📊 March 2023 counts:",
      march2023.reduce(
        (acc, item) => {
          acc[item._id.treatmentCode] = item.count;
          return acc;
        },
        {} as Record<string, number>
      )
    );

    return transformedData;
  } catch (error) {
    console.error("❌ Error fetching treatment data from MongoDB:", error);
    throw new Error(
      `Failed to fetch treatment data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
