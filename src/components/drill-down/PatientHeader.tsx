import { formatISODate } from "../../utils/dateUtils";

interface PatientHeaderProps {
  patientId: string; // Ya anonimizado (****xxxx)
  patientAge: number | "ND";
  date: Date;
  className?: string;
}

/**
 * Header del card mostrando información del paciente
 */
export function PatientHeader({
  patientId,
  patientAge,
  date,
  className = "",
}: PatientHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${className}`}>
      {/* Paciente y edad */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👤</span>
          <div>
            <div className="text-sm text-gray-500 font-medium">Paciente</div>
            <div className="text-lg font-mono font-semibold text-gray-900">
              {patientId}
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-gray-300" /> {/* Separador vertical */}

        <div className="flex items-center gap-2">
          <span className="text-xl">🎂</span>
          <div>
            <div className="text-sm text-gray-500 font-medium">Edad</div>
            <div className="text-lg font-semibold text-gray-900">
              {patientAge === "ND" ? (
                <span className="text-gray-400 italic">N/D</span>
              ) : (
                `${patientAge} años`
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fecha */}
      <div className="flex items-center gap-2">
        <span className="text-xl">📅</span>
        <div>
          <div className="text-sm text-gray-500 font-medium">Fecha</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatISODate(date)}
          </div>
        </div>
      </div>
    </div>
  );
}









