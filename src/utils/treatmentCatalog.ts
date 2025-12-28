/**
 * Catálogo de códigos de tratamiento dental
 * 
 * Este catálogo está basado en ApointmentSubjectCategoriesCat del dominio
 * (dentanum/packages/domain/healthcare/catalogs.ts)
 * 
 * IMPORTANTE: Si se actualiza el catálogo en el dominio, este archivo debe
 * actualizarse también para mantener la consistencia.
 */

export interface TreatmentCategory {
  _id: string; // Código del tratamiento (ej: "RES", "ODG")
  description: string; // Descripción completa
}

/**
 * Catálogo completo de categorías de tratamiento
 * 
 * Este catálogo incluye TODOS los códigos encontrados en la BD:
 * - patientsData (atenciones) - recordTypeSubcategory.code
 * - moneyAccountsData (ventas) - recordTypeSubcategory.code
 * 
 * Actualizado automáticamente desde la BD usando discover-treatment-codes.ts
 * Última actualización: 2025-12-17
 */
export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  { _id: "#N/A", description: "Productos Dentales" },
  { _id: "END", description: "Tratamiento / Atención de Endodoncia" },
  { _id: "EST", description: "Estética Dental" },
  { _id: "EXO", description: "Tratamiento / Atención de Exodoncia" },
  { _id: "EXQ", description: "Tratamiento / Atención de Exodoncia Quirúrgica" },
  { _id: "IMG", description: "Imagenología" },
  { _id: "IMP", description: "Tratamiento / Atención de Implantes" },
  { _id: "INT", description: "Tratamiento / Atención de Odontología Integral" },
  { _id: "ODG", description: "Odontología General" },
  { _id: "ODP", description: "Odontopediatría" },
  { _id: "ODQ", description: "Tratamiento / Atención de Odontología Quirúrgica" },
  { _id: "OTD", description: "Ortodoncia" },
  { _id: "OTP", description: "Tratamiento / Atención de Ortopedia" },
  { _id: "PER", description: "Periodoncia" },
  { _id: "PRD", description: "Tratamiento / Atención de Prostodoncia" },
  { _id: "PRI", description: "Consulta de Primera Vez" },
  { _id: "PRO", description: "Prótesis" },
  { _id: "PUL", description: "Tratamiento / Atención de Problemas Pulpares" },
  { _id: "RES", description: "Restauraciones" },
  // Códigos adicionales que pueden aparecer en datos históricos
  { _id: "DUD", description: "Aclaración de Dudas sobre Tratamiento Dental" },
  { _id: "RTR", description: "Reinicio de Tratamiento" },
  { _id: "NCA", description: "Sin Categoría" },
];

/**
 * Convierte el catálogo en un Record<string, string> para fácil acceso
 * Formato: { "RES": "Restauraciones", "ODG": "Odontología General", ... }
 * 
 * Usa descripciones cortas para display en UI
 * Basado en códigos reales encontrados en la BD (patientsData + moneyAccountsData)
 */
export const TREATMENT_DESCRIPTIONS: Record<string, string> = {
  "#N/A": "Productos Dentales",
  END: "Endodoncia",
  EST: "Estética Dental",
  EXO: "Exodoncia",
  EXQ: "Exodoncia Quirúrgica",
  IMG: "Imagenología",
  IMP: "Implantes",
  INT: "Odontología Integral",
  ODG: "Odontología General",
  ODP: "Odontopediatría",
  ODQ: "Odontología Quirúrgica",
  OTD: "Ortodoncia",
  OTP: "Ortopedia",
  PER: "Periodoncia",
  PRD: "Prostodoncia",
  PRI: "Primera Vez",
  PRO: "Prótesis",
  PUL: "Problemas Pulpares",
  RES: "Restauraciones",
  // Códigos adicionales que pueden aparecer en datos históricos
  DUD: "Dudas/Consultas",
  RTR: "Reinicio de Tratamiento",
  NCA: "Sin Categoría",
};

/**
 * Obtiene la descripción de un código de tratamiento
 * @param code Código del tratamiento (ej: "RES")
 * @returns Descripción corta o el código si no se encuentra
 */
export function getTreatmentDescription(code: string): string {
  return TREATMENT_DESCRIPTIONS[code] || code;
}

/**
 * Obtiene la descripción completa de un código de tratamiento desde el catálogo
 * @param code Código del tratamiento (ej: "RES")
 * @returns Descripción completa o el código si no se encuentra
 */
export function getTreatmentFullDescription(code: string): string {
  const category = TREATMENT_CATEGORIES.find((cat) => cat._id === code);
  return category?.description || code;
}

/**
 * Verifica si un código de tratamiento existe en el catálogo
 * @param code Código del tratamiento
 * @returns true si existe, false si no
 */
export function isValidTreatmentCode(code: string): boolean {
  return TREATMENT_CATEGORIES.some((cat) => cat._id === code);
}

