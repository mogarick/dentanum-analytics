interface SaleSectionProps {
  sale?: {
    time: string;
    procedureCode: string;
    procedureDescription: string;
    amount: number;
  };
  timeDifferenceMinutes?: number;
  className?: string;
}

/**
 * Sección que muestra los datos de la venta
 */
export function SaleSection({
  sale,
  timeDifferenceMinutes,
  className = "",
}: SaleSectionProps) {
  if (!sale) {
    return (
      <div className={`rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💰</span>
          <span className="font-semibold text-orange-800">Sin Venta Registrada</span>
        </div>
        <p className="text-sm text-orange-600">
          No se encontró una venta asociada a esta atención.
        </p>
      </div>
    );
  }

  // Formatear monto en MXN
  const formattedAmount = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(sale.amount);

  // Formatear diferencia de tiempo
  let timeDiffDisplay = null;
  if (timeDifferenceMinutes !== undefined) {
    if (timeDifferenceMinutes < 60) {
      timeDiffDisplay = `⏱️ ${timeDifferenceMinutes} min después`;
    } else {
      const hours = Math.floor(timeDifferenceMinutes / 60);
      const minutes = timeDifferenceMinutes % 60;
      timeDiffDisplay = `⏱️ ${hours}h ${minutes}m después`;
    }
  }

  return (
    <div className={`rounded-lg border-2 border-green-300 bg-green-50 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <h3 className="font-semibold text-gray-900">Venta</h3>
        </div>
        <span className="text-2xl font-bold text-green-700">{formattedAmount}</span>
      </div>

      {/* Detalles de la venta */}
      <div className="space-y-2">
        {/* Hora */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 w-20">Hora:</span>
          <span className="text-sm font-mono font-semibold text-gray-900">{sale.time}</span>
        </div>

        {/* Procedimiento */}
        <div className="flex items-start gap-2">
          <span className="text-sm font-medium text-gray-600 w-20">Proc.:</span>
          <div>
            <span className="text-sm font-mono font-bold text-blue-600">
              {sale.procedureCode}
            </span>
            <span className="text-sm text-gray-700 ml-2">
              {sale.procedureDescription}
            </span>
          </div>
        </div>

        {/* Diferencia de tiempo (si existe match) */}
        {timeDiffDisplay && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded inline-block">
              {timeDiffDisplay}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}









