import { getMongoClient } from "../utils/mongodb.server";
import type {
  MoneyData,
  MoneyDataMongoResponse,
} from "../types/moneyData.types";

const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "sakdental";
const MONGODB_COLLECTION = "moneyAccountsData";

export async function getMoneyDataByMonth(): Promise<MoneyData[]> {
  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection(MONGODB_COLLECTION);

    console.log(
      `🔍 Fetching money data from ${MONGODB_DATABASE}.${MONGODB_COLLECTION}`
    );

    // Agregación de MongoDB para datos de dinero
    const results = await collection
      .aggregate<MoneyDataMongoResponse>(
        [
          {
            $match: {
              date: { $ne: null },
              recordTypeSubcategory: { $ne: null },
              recordTypeCategory: { code: "DentalHealthcareServiceItem" },
              ownerAccount: "MGyL1bJHV1DK",
            },
          },
          {
            $addFields: {
              year: { $year: "$date" },
              month: { $month: "$date" },
              yearMonth: {
                $dateToString: {
                  date: "$date",
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
              totalAmount: { $sum: { $abs: "$value" } }, // Suma valores absolutos
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
          hint: { _id: 1 },
        }
      )
      .toArray();

    // Transformar al formato esperado por el componente
    const transformedData: MoneyData[] = results.map((item) => ({
      _id: {
        yearMonth: item._id.yearMonth,
        treatmentCode: item._id.treatmentCode,
      },
      totalAmount: item.totalAmount,
    }));

    console.log(
      `✅ Loaded ${transformedData.length} money records from MongoDB`
    );

    return transformedData;
  } catch (error) {
    console.error("❌ Error fetching money data from MongoDB:", error);
    throw new Error(
      `Failed to fetch money data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

