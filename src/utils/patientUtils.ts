/**
 * Utilidades para manejo de datos de pacientes
 */

/**
 * Extrae el patientId de un _id de HealthStory
 * @example "P#ixYYSxO6f1lM_HS#KUJtIu-LkvKZ" => "P#ixYYSxO6f1lM"
 */
export function extractPatientId(healthStoryId: string): string {
  const match = healthStoryId.match(/^(P#[^_]+)/);
  return match ? match[1] : healthStoryId;
}

/**
 * Anonimiza un patientId mostrando solo los últimos 4 caracteres
 * @example "P#ixYYSxO6f1lM" => "****f1lM"
 */
export function anonymizePatientId(patientId: string): string {
  if (patientId.length <= 4) {
    return patientId;
  }
  const lastFour = patientId.slice(-4);
  return `****${lastFour}`;
}

/**
 * Calcula la edad en años a partir de una fecha de nacimiento
 * @returns Edad en años o "ND" si la fecha es null/inválida
 */
export function calculateAge(birthdate: Date | null | undefined): number | "ND" {
  if (!birthdate) {
    return "ND";
  }

  const today = new Date();
  const birth = new Date(birthdate);

  if (isNaN(birth.getTime())) {
    return "ND";
  }

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Ajustar si aún no ha cumplido años este año
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age : "ND";
}






