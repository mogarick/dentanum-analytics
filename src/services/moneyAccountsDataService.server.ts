import { getMongoClient } from "../utils/mongodb.server";

const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "sakdental";
const MONGODB_COLLECTION = "moneyAccountsData";

export interface MoneyAccountData {
  _id: {
    yearMonth: string;
    treatmentCode: string;
  };
  count: number;
}

export interface MoneyAccountDataMongoResponse {
  _id: {
    yearMonth: string;
    year: number;
    month: number;
    treatmentCode: string;
    treatmentDescription: string;
  };
  count: number;
}

export async function getMoneyAccountsDataByMonth(): Promise<MoneyAccountData[]> {
  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection(MONGODB_COLLECTION);

    console.log(
      `🔍 Fetching money accounts data from ${MONGODB_DATABASE}.${MONGODB_COLLECTION}`
    );

    // Aggregation for money accounts - services sold (DentalHealthcareServiceItem)
    const results = await collection
      .aggregate<MoneyAccountDataMongoResponse>(
        [
          {
            $match: {
              date: { $ne: null },
              recordTypeSubcategory: { $ne: null },
              "recordTypeCategory.code": "DentalHealthcareServiceItem",
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
          hint: { _id: 1 },
        }
      )
      .toArray();

    // Transform to expected format
    const transformedData: MoneyAccountData[] = results.map((item) => ({
      _id: {
        yearMonth: item._id.yearMonth,
        treatmentCode: item._id.treatmentCode,
      },
      count: item.count,
    }));

    console.log(
      `✅ Loaded ${transformedData.length} money account records from MongoDB`
    );
    console.log("🔍 Sample transformed data:", transformedData.slice(0, 3));

    return transformedData;
  } catch (error) {
    console.error("❌ Error fetching money accounts data from MongoDB:", error);
    throw new Error(
      `Failed to fetch money accounts data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

