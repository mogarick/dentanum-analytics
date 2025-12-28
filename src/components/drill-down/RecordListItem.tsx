import { PatientHeader } from "./PatientHeader";
import { AttentionSection } from "./AttentionSection";
import { SaleSection } from "./SaleSection";
import type { ConsolidatedRecord } from "../../types/procedureDetail.types";

interface RecordListItemProps {
  record: ConsolidatedRecord;
  className?: string;
}

/**
 * Item de lista que muestra un registro consolidado (atención + venta)
 * - Mobile: layout vertical (stack)
 * - Desktop: layout horizontal (2 columnas)
 */
export function RecordListItem({ record, className = "" }: RecordListItemProps) {
  // Determinar color de borde según estado de conciliación
  const borderColors = {
    "perfect-match": "border-green-400",
    "likely-match": "border-yellow-400",
    "attention-only": "border-orange-400",
    "sale-only": "border-red-400",
  };

  const borderColor = borderColors[record.conciliationStatus];

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 ${borderColor} ${className}`}
    >
      {/* Patient Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <PatientHeader
          patientId={record.patientId}
          patientAge={record.patientAge}
          date={record.date}
        />
      </div>

      {/* Content: Atención + Venta */}
      <div className="p-4 sm:p-6">
        {/* Mobile: Stack vertical */}
        <div className="flex flex-col md:hidden gap-4">
          <AttentionSection
            attention={record.attention}
            conciliationStatus={record.conciliationStatus}
          />
          <SaleSection
            sale={record.sale}
            timeDifferenceMinutes={record.timeDifferenceMinutes}
          />
        </div>

        {/* Desktop: 2 columnas */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-6">
          <AttentionSection
            attention={record.attention}
            conciliationStatus={record.conciliationStatus}
          />
          <SaleSection
            sale={record.sale}
            timeDifferenceMinutes={record.timeDifferenceMinutes}
          />
        </div>
      </div>
    </div>
  );
}






