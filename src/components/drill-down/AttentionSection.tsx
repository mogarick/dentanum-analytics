import { NoteField } from "./NoteField";
import type { ConciliationStatus } from "../../types/procedureDetail.types";

interface AttentionSectionProps {
  attention?: {
    time: string;
    procedureCode: string;
    procedureDescription: string;
    reason: string;
    note: string;
  };
  conciliationStatus: ConciliationStatus;
  className?: string;
}

/**
 * Sección que muestra los datos de la atención
 */
export function AttentionSection({
  attention,
  conciliationStatus,
  className = "",
}: AttentionSectionProps) {
  // Badge según estado de conciliación
  const statusConfig = {
    "perfect-match": {
      icon: "✅",
      label: "Match Perfecto",
      color: "bg-green-100 text-green-800 border-green-300",
    },
    "likely-match": {
      icon: "🟡",
      label: "Match Probable",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    "attention-only": {
      icon: "⚠️",
      label: "Sin Venta",
      color: "bg-orange-100 text-orange-800 border-orange-300",
    },
    "sale-only": {
      icon: "❌",
      label: "Sin Atención",
      color: "bg-red-100 text-red-800 border-red-300",
    },
  };

  const status = statusConfig[conciliationStatus];

  if (!attention) {
    return (
      <div className={`rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{status.icon}</span>
          <span className="font-semibold text-red-800">Sin Atención Registrada</span>
        </div>
        <p className="text-sm text-red-600">
          No se encontró una atención asociada a esta venta.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 ${status.color} p-4 ${className}`}>
      {/* Header con badge de estado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <h3 className="font-semibold text-gray-900">Atención</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Detalles de la atención */}
      <div className="space-y-2">
        {/* Hora */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 w-20">Hora:</span>
          <span className="text-sm font-mono font-semibold text-gray-900">{attention.time}</span>
        </div>

        {/* Procedimiento */}
        <div className="flex items-start gap-2">
          <span className="text-sm font-medium text-gray-600 w-20">Proc.:</span>
          <div>
            <span className="text-sm font-mono font-bold text-blue-600">
              {attention.procedureCode}
            </span>
            <span className="text-sm text-gray-700 ml-2">
              {attention.procedureDescription}
            </span>
          </div>
        </div>

        {/* Motivo */}
        <div className="flex items-start gap-2">
          <span className="text-sm font-medium text-gray-600 w-20">Motivo:</span>
          <span className="text-sm text-gray-700">{attention.reason}</span>
        </div>

        {/* Nota */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            📝 Nota de Atención
          </div>
          <NoteField note={attention.note} maxLines={3} />
        </div>
      </div>
    </div>
  );
}









