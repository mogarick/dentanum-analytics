import type { ConciliationStatus } from "../../types/procedureDetail.types";

interface FilterBarProps {
  /** Callback cuando cambia el filtro de estado */
  onStatusChange: (status: ConciliationStatus | "all") => void;
  /** Estado actual seleccionado */
  currentStatus: ConciliationStatus | "all";
  /** Callback para limpiar todos los filtros */
  onClearFilters: () => void;
}

const STATUS_OPTIONS: Array<{ value: ConciliationStatus | "all"; label: string; icon: string }> = [
  { value: "all", label: "Todos los registros", icon: "📋" },
  { value: "perfect-match", label: "Match Perfecto", icon: "✅" },
  { value: "likely-match", label: "Match Probable", icon: "🟡" },
  { value: "attention-only", label: "Solo Atención", icon: "⚠️" },
  { value: "sale-only", label: "Solo Venta", icon: "❌" },
];

/**
 * Barra de filtros para la vista de drill-down
 */
export function FilterBar({
  onStatusChange,
  currentStatus,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters = currentStatus !== "all";

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Filtro por estado */}
        <div className="flex-1">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            🔍 Filtrar por Estado
          </label>
          <select
            id="status-filter"
            value={currentStatus}
            onChange={(e) => onStatusChange(e.target.value as ConciliationStatus | "all")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors whitespace-nowrap"
            >
              🗑️ Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {currentStatus !== "all" && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              {STATUS_OPTIONS.find((opt) => opt.value === currentStatus)?.icon}{" "}
              {STATUS_OPTIONS.find((opt) => opt.value === currentStatus)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}









