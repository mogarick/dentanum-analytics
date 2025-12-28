import { useState } from "react";

interface NoteFieldProps {
  note: string;
  maxLines?: number;
  className?: string;
}

/**
 * Componente para mostrar notas con opción de expandir/colapsar
 * - En mobile: muestra 3 líneas por defecto
 * - En desktop: muestra 4 líneas por defecto
 * - Botón para ver completo/ocultar
 */
export function NoteField({ note, maxLines = 3, className = "" }: NoteFieldProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!note || note.trim() === "") {
    return (
      <div className={`text-gray-400 italic text-sm ${className}`}>
        Sin nota registrada
      </div>
    );
  }

  // Heurística simple: si tiene más de 150 caracteres, probablemente necesita expandirse
  const needsExpansion = note.length > 150;

  return (
    <div className={className}>
      <div
        className={`text-gray-700 text-sm leading-relaxed ${
          !isExpanded && needsExpansion ? `line-clamp-${maxLines}` : ""
        }`}
        style={
          !isExpanded && needsExpansion
            ? {
                display: "-webkit-box",
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {note}
      </div>

      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1 transition-colors"
        >
          {isExpanded ? "← Ocultar nota" : "Ver nota completa →"}
        </button>
      )}
    </div>
  );
}






