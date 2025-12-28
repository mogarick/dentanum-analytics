import type { Route } from "./+types/procedure-detail";
import { ProcedureDetailPage } from "../components/drill-down/ProcedureDetailPage";
import { getConsolidatedRecords } from "../services/procedureDetailService.server";
import type { ProcedureDetailFilters } from "../types/procedureDetail.types";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { procedureCode } = params;
  
  if (!procedureCode) {
    throw new Response("Procedure code is required", { status: 400 });
  }

  // Extraer query parameters
  const url = new URL(request.url);
  const year = url.searchParams.get("year") || undefined;
  const month = url.searchParams.get("month") || undefined;
  const day = url.searchParams.get("day") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const filters: ProcedureDetailFilters = {
    procedureCode,
    year,
    month,
    day,
  };

  try {
    // Cargar 100 registros para permitir client-side filtering e infinite scroll
    const data = await getConsolidatedRecords(filters, page, 100);
    return data;
  } catch (error) {
    console.error("Error loading procedure detail:", error);
    throw new Response("Failed to load procedure data", { status: 500 });
  }
}

export default function ProcedureDetail() {
  return <ProcedureDetailPage />;
}
