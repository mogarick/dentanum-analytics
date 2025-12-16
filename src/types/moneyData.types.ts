// Formato esperado por el componente (similar a TreatmentData)
export interface MoneyData {
  _id: {
    yearMonth: string;
    treatmentCode: string;
  };
  totalAmount: number;
}

// Respuesta de MongoDB (antes de transformar)
export interface MoneyDataMongoResponse {
  _id: {
    yearMonth: string;
    year: number;
    month: number;
    treatmentCode: string;
    treatmentDescription: string;
  };
  totalAmount: number;
}

