import type { Route } from "./+types/home";
import { useRevalidator } from "react-router";
import { getTreatmentDataByMonth } from "../services/treatmentDataService.server";
import { getMoneyDataByMonth } from "../services/moneyDataService.server";
import DentalTreatmentDashboard from "../components/DentalTreatmentDashboard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";

// ✅ Server Loader: corre en el servidor Node.js de React Router
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const [treatmentData, moneyData] = await Promise.all([
      getTreatmentDataByMonth(),
      getMoneyDataByMonth(),
    ]);
    return { treatmentData, moneyData };
  } catch (error) {
    console.error("❌ Error in loader:", error);
    throw error;
  }
}

// ✅ Client Loader: caché en cliente para navegaciones subsecuentes
const cache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function clientLoader({
  request,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const cacheKey = "dashboardData";
  const cachedEntry = cache.get(cacheKey);

  // Verificar si hay datos en caché y no han expirado
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
    console.log("📦 Usando datos en caché del cliente");
    return cachedEntry.data;
  }

  // Primera carga o caché expirado: obtener del servidor
  console.log("🔄 Cargando datos del servidor...");
  const data = await serverLoader();

  // Guardar en caché
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });

  return data;
}

// ✅ Hidratar desde server data en la primera carga
clientLoader.hydrate = true as const;

// Componente principal
export default function Home({ loaderData }: Route.ComponentProps) {
  const revalidator = useRevalidator();

  const handleRefresh = () => {
    // Limpiar caché del cliente
    cache.clear();
    console.log("🧹 Caché limpiado, recargando datos...");
    // Forzar revalidación (llama al loader nuevamente)
    revalidator.revalidate();
  };

  return (
    <DentalTreatmentDashboard
      treatmentData={loaderData.treatmentData}
      moneyData={loaderData.moneyData}
      onRefresh={handleRefresh}
      isRefreshing={revalidator.state === "loading"}
    />
  );
}

// HydrateFallback: Mostrar durante hidratación inicial
export function HydrateFallback() {
  return <LoadingSpinner />;
}

// ErrorBoundary: Manejo de errores
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <ErrorDisplay
      error={
        error instanceof Error
          ? error
          : new Error("Error desconocido al cargar datos")
      }
      onRetry={handleRetry}
    />
  );
}
