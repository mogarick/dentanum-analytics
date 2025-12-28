/**
 * Utilidades para manejo de fechas
 */

/**
 * Formatea una fecha a formato de hora HH:mm
 * @example new Date("2024-03-15T09:30:00") => "09:30"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return "--:--";
  }

  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  
  return `${hours}:${minutes}`;
}

/**
 * Calcula la diferencia en minutos entre dos fechas
 * @returns Diferencia en minutos (siempre positiva)
 */
export function calculateTimeDifference(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return 0;
  }

  const diffMs = Math.abs(d1.getTime() - d2.getTime());
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Verifica si dos fechas son del mismo día
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return false;
  }

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Formatea una fecha a formato ISO date (YYYY-MM-DD)
 */
export function formatISODate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return "";
  }

  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}






