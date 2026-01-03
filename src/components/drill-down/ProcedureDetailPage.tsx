import { useParams, useSearchParams, Link, useLoaderData } from "react-router";
import { useState, useMemo } from "react";
import type { ConsolidatedResponse, ConciliationStatus, ConsolidatedRecord } from "../types/procedureDetail.types";
import { RecordListItem } from "./RecordListItem";
import { FilterBar } from "./FilterBar";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { getTreatmentDescription } from "../../utils/treatmentCatalog";

// Helper para agrupar registros por fecha
function groupRecordsByDate(records: ConsolidatedRecord[]): Map<string, ConsolidatedRecord[]> {
  const grouped = new Map<string, ConsolidatedRecord[]>();
  
  records.forEach((record) => {
    const dateKey = record.date.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(record);
  });
  
  // Ordenar las fechas de más reciente a más antigua
  return new Map([...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

// Helper para formatear fecha como header
function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Comparar solo las fechas (sin hora)
  const dateOnly = date.toISOString().split('T')[0];
  const todayOnly = today.toISOString().split('T')[0];
  const yesterdayOnly = yesterday.toISOString().split('T')[0];
  
  if (dateOnly === todayOnly) {
    return `Hoy - ${date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  } else if (dateOnly === yesterdayOnly) {
    return `Ayer - ${date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  } else {
    return date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}

export const ProcedureDetailPage = () => {
  // Obtener datos del loader
  const data = useLoaderData<ConsolidatedResponse>();
  
  // Obtener código de procedimiento de la URL
  const { procedureCode } = useParams<{ procedureCode: string }>();

  // Obtener filtros de query params
  const [searchParams] = useSearchParams();
  const year = searchParams.get("year") || undefined;
  const month = searchParams.get("month") || undefined;
  const day = searchParams.get("day") || undefined;

  // Estados para filtros locales (client-side)
  const [statusFilter, setStatusFilter] = useState<ConciliationStatus | "all">("all");
  const [displayCount, setDisplayCount] = useState(20); // Mostrar 20 registros inicialmente
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Obtener nombre del procedimiento desde el catálogo
  const procedureName = procedureCode
    ? getTreatmentDescription(procedureCode)
    : "Procedimiento";

  // Construir filtros display
  const filtersDisplay = [year, month, day].filter(Boolean).join("-") || "Todos los periodos";
  
  // Helper para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Filtrar registros localmente (client-side filtering)
  const filteredRecords = useMemo(() => {
    let filtered = [...data.records];

    // Filtrar por estado de conciliación
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.conciliationStatus === statusFilter);
    }

    return filtered;
  }, [data.records, statusFilter]);

  // Registros a mostrar (con infinite scroll)
  const displayedRecords = useMemo(() => {
    // Si hay filtros activos, mostrar todos los resultados filtrados
    if (statusFilter !== "all") {
      return filteredRecords;
    }
    // Si no hay filtros, aplicar infinite scroll
    return filteredRecords.slice(0, displayCount);
  }, [filteredRecords, displayCount, statusFilter]);

  // Agrupar registros mostrados por fecha
  const groupedRecords = useMemo(() => {
    return groupRecordsByDate(displayedRecords);
  }, [displayedRecords]);

  // Callback para cargar más registros
  const loadMoreRecords = () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Simular carga (smooth UX)
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 20, filteredRecords.length));
      setIsLoadingMore(false);
    }, 300);
  };

  // Hook de infinite scroll
  const hasMoreToLoad = displayCount < filteredRecords.length && statusFilter === "all";
  const { observerRef } = useInfiniteScroll({
    onLoadMore: loadMoreRecords,
    hasMore: hasMoreToLoad,
    isLoading: isLoadingMore,
  });

  // Handlers para filtros
  const handleStatusChange = (status: ConciliationStatus | "all") => {
    setStatusFilter(status);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setDisplayCount(20); // Reset display count
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <nav className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium flex items-center gap-2"
        >
          <span>←</span>
          <span>Volver al Dashboard</span>
        </Link>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-900">
              🦷 {procedureCode} - {procedureName}
            </h1>
            <p className="text-sm text-gray-600">
              📅 {filtersDisplay}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Resumen</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Registros</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalRecords}</p>
            </div>
            <div>
              <p className="text-gray-600">✅ Perfect Match</p>
              <p className="text-2xl font-bold text-green-600">{data.stats.perfectMatches}</p>
            </div>
            <div>
              <p className="text-gray-600">⚠️ Sin Venta</p>
              <p className="text-2xl font-bold text-orange-600">{data.stats.attentionOnly}</p>
            </div>
            <div>
              <p className="text-gray-600">❌ Sin Atención</p>
              <p className="text-2xl font-bold text-red-600">{data.stats.saleOnly}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <p>Tasa de conciliación: <strong>{data.stats.conciliationRate.toFixed(1)}%</strong></p>
            <p>Total ventas: <strong>{formatCurrency(data.stats.totalSalesAmount)}</strong></p>
          </div>
        </div>

        {/* Barra de filtros */}
        <FilterBar
          currentStatus={statusFilter}
          onStatusChange={handleStatusChange}
          onClearFilters={handleClearFilters}
        />

        {/* Lista de registros */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              📋 Registros ({displayedRecords.length}
              {displayedRecords.length !== filteredRecords.length && 
                ` de ${filteredRecords.length}`}
              {filteredRecords.length !== data.pagination.totalRecords && 
                ` (${data.pagination.totalRecords} totales)`})
            </h2>
          </div>
          
          {displayedRecords.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">
                {data.records.length === 0 ? "📭" : "🔍"}
              </div>
              <p className="text-xl text-gray-500 font-medium">
                {data.records.length === 0
                  ? "No se encontraron registros para este procedimiento."
                  : "No hay registros que coincidan con los filtros aplicados."}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {data.records.length === 0
                  ? "Intenta ajustar los filtros de fecha o selecciona otro procedimiento."
                  : "Intenta ajustar o limpiar los filtros para ver más resultados."}
              </p>
              {statusFilter !== "all" && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🗑️ Limpiar Filtros
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Renderizar registros agrupados por fecha */}
              {Array.from(groupedRecords.entries()).map(([dateKey, records]) => (
                <div key={dateKey} className="space-y-4">
                  {/* Sticky Date Header */}
                  <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <h3 className="text-lg font-bold">
                          {formatDateHeader(dateKey)}
                        </h3>
                        <p className="text-sm text-blue-100">
                          {records.length} {records.length === 1 ? 'registro' : 'registros'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Registros del día */}
                  <div className="space-y-4">
                    {records.map((record) => (
                      <RecordListItem key={record.id} record={record} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Elemento observador para infinite scroll */}
              {hasMoreToLoad && (
                <div ref={observerRef} className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <div className="animate-pulse">
                    <div className="text-2xl mb-2">⏳</div>
                    <p className="text-sm text-gray-600">Cargando más registros...</p>
                  </div>
                </div>
              )}

              {/* Info final */}
              {!hasMoreToLoad && displayedRecords.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-sm text-gray-600">
                    {statusFilter === "all" ? (
                      <>
                        ✅ Mostrando todos los <strong>{displayedRecords.length}</strong> registros
                        {data.pagination.hasMore && (
                          <span className="block mt-2 text-xs text-gray-500">
                            (Los primeros {data.pagination.pageSize} de {data.pagination.totalRecords} totales en la base de datos)
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        ✅ Mostrando todos los <strong>{displayedRecords.length}</strong> registros filtrados
                        {" "}de <strong>{filteredRecords.length}</strong> que coinciden
                      </>
                    )}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

