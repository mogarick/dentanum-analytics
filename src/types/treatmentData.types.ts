// Formato esperado por el componente (mantener compatible con App.tsx actual)
export interface TreatmentData {
  _id: {
    yearMonth: string;
    treatmentCode: string;
  };
  count: number;
}

// Respuesta de MongoDB (antes de transformar)
export interface TreatmentDataMongoResponse {
  _id: {
    yearMonth: string;
    year: number;
    month: number;
    treatmentCode: string;
    treatmentDescription: string;
  };
  count: number;
}






