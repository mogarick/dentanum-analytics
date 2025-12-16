import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// interface ProcessedData {
//   yearMonth: string;
//   [key: string]: string | number;
// }

const DentalTreatmentDashboard = () => {
  // Treatment descriptions
  const treatmentDescriptions: Record<string, string> = {
    RES: "Restauración Dental",
    ODG: "Odontología General",
    OTD: "Ortodoncia",
    PRO: "Prótesis Dental",
    EXO: "Exodoncia",
    END: "Endodoncia",
    PRI: "Periodoncia",
    EXQ: "Exodoncia Quirúrgica",
    OTP: "Ortopedia",
    ODP: "Odontopediatría",
    PER: "Periodoncia",
    IMP: "Implantes",
    PRD: "Prótesis Dentales",
    ODQ: "Odontología Quirúrgica",
    DUD: "Dudas/Consultas",
    RTR: "Retratamiento",
    EST: "Estética Dental",
    NCA: "No Categorizado",
  };

  // Raw data
  const rawData = [
    {
      _id: {
        yearMonth: "2023-03",
        treatmentCode: "RES",
      },
      count: 15,
    },
    {
      _id: {
        yearMonth: "2023-03",
        treatmentCode: "ODG",
      },
      count: 8,
    },
    {
      _id: {
        yearMonth: "2023-03",
        treatmentCode: "OTD",
      },
      count: 12,
    },
    {
      _id: {
        yearMonth: "2023-03",
        treatmentCode: "PRO",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2023-03",
        treatmentCode: "EXO",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2023-03",
        treatmentCode: "END",
      },
      count: 3,
    },
    {
      _id: {
        yearMonth: "2023-04",
        treatmentCode: "RES",
      },
      count: 18,
    },
    {
      _id: {
        yearMonth: "2023-04",
        treatmentCode: "ODG",
      },
      count: 10,
    },
    {
      _id: {
        yearMonth: "2023-04",
        treatmentCode: "OTD",
      },
      count: 14,
    },
    {
      _id: {
        yearMonth: "2023-04",
        treatmentCode: "PRO",
      },
      count: 7,
    },
    {
      _id: {
        yearMonth: "2023-04",
        treatmentCode: "EXO",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2023-04",
        treatmentCode: "END",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2023-05",
        treatmentCode: "RES",
      },
      count: 22,
    },
    {
      _id: {
        yearMonth: "2023-05",
        treatmentCode: "ODG",
      },
      count: 12,
    },
    {
      _id: {
        yearMonth: "2023-05",
        treatmentCode: "OTD",
      },
      count: 16,
    },
    {
      _id: {
        yearMonth: "2023-05",
        treatmentCode: "PRO",
      },
      count: 9,
    },
    {
      _id: {
        yearMonth: "2023-05",
        treatmentCode: "EXO",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2023-05",
        treatmentCode: "END",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2023-06",
        treatmentCode: "RES",
      },
      count: 20,
    },
    {
      _id: {
        yearMonth: "2023-06",
        treatmentCode: "ODG",
      },
      count: 11,
    },
    {
      _id: {
        yearMonth: "2023-06",
        treatmentCode: "OTD",
      },
      count: 15,
    },
    {
      _id: {
        yearMonth: "2023-06",
        treatmentCode: "PRO",
      },
      count: 8,
    },
    {
      _id: {
        yearMonth: "2023-06",
        treatmentCode: "EXO",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2023-06",
        treatmentCode: "END",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2023-07",
        treatmentCode: "RES",
      },
      count: 25,
    },
    {
      _id: {
        yearMonth: "2023-07",
        treatmentCode: "ODG",
      },
      count: 14,
    },
    {
      _id: {
        yearMonth: "2023-07",
        treatmentCode: "OTD",
      },
      count: 18,
    },
    {
      _id: {
        yearMonth: "2023-07",
        treatmentCode: "PRO",
      },
      count: 10,
    },
    {
      _id: {
        yearMonth: "2023-07",
        treatmentCode: "EXO",
      },
      count: 7,
    },
    {
      _id: {
        yearMonth: "2023-07",
        treatmentCode: "END",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2023-08",
        treatmentCode: "RES",
      },
      count: 23,
    },
    {
      _id: {
        yearMonth: "2023-08",
        treatmentCode: "ODG",
      },
      count: 13,
    },
    {
      _id: {
        yearMonth: "2023-08",
        treatmentCode: "OTD",
      },
      count: 17,
    },
    {
      _id: {
        yearMonth: "2023-08",
        treatmentCode: "PRO",
      },
      count: 9,
    },
    {
      _id: {
        yearMonth: "2023-08",
        treatmentCode: "EXO",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2023-08",
        treatmentCode: "END",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2023-09",
        treatmentCode: "RES",
      },
      count: 19,
    },
    {
      _id: {
        yearMonth: "2023-09",
        treatmentCode: "ODG",
      },
      count: 10,
    },
    {
      _id: {
        yearMonth: "2023-09",
        treatmentCode: "OTD",
      },
      count: 14,
    },
    {
      _id: {
        yearMonth: "2023-09",
        treatmentCode: "PRO",
      },
      count: 7,
    },
    {
      _id: {
        yearMonth: "2023-09",
        treatmentCode: "EXO",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2023-09",
        treatmentCode: "END",
      },
      count: 3,
    },
    {
      _id: {
        yearMonth: "2023-10",
        treatmentCode: "RES",
      },
      count: 21,
    },
    {
      _id: {
        yearMonth: "2023-10",
        treatmentCode: "ODG",
      },
      count: 12,
    },
    {
      _id: {
        yearMonth: "2023-10",
        treatmentCode: "OTD",
      },
      count: 16,
    },
    {
      _id: {
        yearMonth: "2023-10",
        treatmentCode: "PRO",
      },
      count: 8,
    },
    {
      _id: {
        yearMonth: "2023-10",
        treatmentCode: "EXO",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2023-10",
        treatmentCode: "END",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2023-11",
        treatmentCode: "RES",
      },
      count: 17,
    },
    {
      _id: {
        yearMonth: "2023-11",
        treatmentCode: "ODG",
      },
      count: 9,
    },
    {
      _id: {
        yearMonth: "2023-11",
        treatmentCode: "OTD",
      },
      count: 13,
    },
    {
      _id: {
        yearMonth: "2023-11",
        treatmentCode: "PRO",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2023-11",
        treatmentCode: "EXO",
      },
      count: 3,
    },
    {
      _id: {
        yearMonth: "2023-11",
        treatmentCode: "END",
      },
      count: 2,
    },
    {
      _id: {
        yearMonth: "2023-12",
        treatmentCode: "RES",
      },
      count: 14,
    },
    {
      _id: {
        yearMonth: "2023-12",
        treatmentCode: "ODG",
      },
      count: 8,
    },
    {
      _id: {
        yearMonth: "2023-12",
        treatmentCode: "OTD",
      },
      count: 11,
    },
    {
      _id: {
        yearMonth: "2023-12",
        treatmentCode: "PRO",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2023-12",
        treatmentCode: "EXO",
      },
      count: 2,
    },
    {
      _id: {
        yearMonth: "2023-12",
        treatmentCode: "END",
      },
      count: 1,
    },
    {
      _id: {
        yearMonth: "2024-01",
        treatmentCode: "RES",
      },
      count: 16,
    },
    {
      _id: {
        yearMonth: "2024-01",
        treatmentCode: "ODG",
      },
      count: 9,
    },
    {
      _id: {
        yearMonth: "2024-01",
        treatmentCode: "OTD",
      },
      count: 12,
    },
    {
      _id: {
        yearMonth: "2024-01",
        treatmentCode: "PRO",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2024-01",
        treatmentCode: "EXO",
      },
      count: 3,
    },
    {
      _id: {
        yearMonth: "2024-01",
        treatmentCode: "END",
      },
      count: 2,
    },
    {
      _id: {
        yearMonth: "2024-02",
        treatmentCode: "RES",
      },
      count: 18,
    },
    {
      _id: {
        yearMonth: "2024-02",
        treatmentCode: "ODG",
      },
      count: 10,
    },
    {
      _id: {
        yearMonth: "2024-02",
        treatmentCode: "OTD",
      },
      count: 14,
    },
    {
      _id: {
        yearMonth: "2024-02",
        treatmentCode: "PRO",
      },
      count: 7,
    },
    {
      _id: {
        yearMonth: "2024-02",
        treatmentCode: "EXO",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2024-02",
        treatmentCode: "END",
      },
      count: 3,
    },
    {
      _id: {
        yearMonth: "2024-03",
        treatmentCode: "RES",
      },
      count: 20,
    },
    {
      _id: {
        yearMonth: "2024-03",
        treatmentCode: "ODG",
      },
      count: 11,
    },
    {
      _id: {
        yearMonth: "2024-03",
        treatmentCode: "OTD",
      },
      count: 15,
    },
    {
      _id: {
        yearMonth: "2024-03",
        treatmentCode: "PRO",
      },
      count: 8,
    },
    {
      _id: {
        yearMonth: "2024-03",
        treatmentCode: "EXO",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2024-03",
        treatmentCode: "END",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2024-04",
        treatmentCode: "RES",
      },
      count: 24,
    },
    {
      _id: {
        yearMonth: "2024-04",
        treatmentCode: "ODG",
      },
      count: 13,
    },
    {
      _id: {
        yearMonth: "2024-04",
        treatmentCode: "OTD",
      },
      count: 18,
    },
    {
      _id: {
        yearMonth: "2024-04",
        treatmentCode: "PRO",
      },
      count: 10,
    },
    {
      _id: {
        yearMonth: "2024-04",
        treatmentCode: "EXO",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2024-04",
        treatmentCode: "END",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2024-05",
        treatmentCode: "RES",
      },
      count: 26,
    },
    {
      _id: {
        yearMonth: "2024-05",
        treatmentCode: "ODG",
      },
      count: 14,
    },
    {
      _id: {
        yearMonth: "2024-05",
        treatmentCode: "OTD",
      },
      count: 20,
    },
    {
      _id: {
        yearMonth: "2024-05",
        treatmentCode: "PRO",
      },
      count: 11,
    },
    {
      _id: {
        yearMonth: "2024-05",
        treatmentCode: "EXO",
      },
      count: 7,
    },
    {
      _id: {
        yearMonth: "2024-05",
        treatmentCode: "END",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2024-06",
        treatmentCode: "RES",
      },
      count: 22,
    },
    {
      _id: {
        yearMonth: "2024-06",
        treatmentCode: "ODG",
      },
      count: 12,
    },
    {
      _id: {
        yearMonth: "2024-06",
        treatmentCode: "OTD",
      },
      count: 17,
    },
    {
      _id: {
        yearMonth: "2024-06",
        treatmentCode: "PRO",
      },
      count: 9,
    },
    {
      _id: {
        yearMonth: "2024-06",
        treatmentCode: "EXO",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2024-06",
        treatmentCode: "END",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2024-07",
        treatmentCode: "RES",
      },
      count: 28,
    },
    {
      _id: {
        yearMonth: "2024-07",
        treatmentCode: "ODG",
      },
      count: 15,
    },
    {
      _id: {
        yearMonth: "2024-07",
        treatmentCode: "OTD",
      },
      count: 21,
    },
    {
      _id: {
        yearMonth: "2024-07",
        treatmentCode: "PRO",
      },
      count: 12,
    },
    {
      _id: {
        yearMonth: "2024-07",
        treatmentCode: "EXO",
      },
      count: 8,
    },
    {
      _id: {
        yearMonth: "2024-07",
        treatmentCode: "END",
      },
      count: 7,
    },
    {
      _id: {
        yearMonth: "2024-08",
        treatmentCode: "RES",
      },
      count: 25,
    },
    {
      _id: {
        yearMonth: "2024-08",
        treatmentCode: "ODG",
      },
      count: 14,
    },
    {
      _id: {
        yearMonth: "2024-08",
        treatmentCode: "OTD",
      },
      count: 19,
    },
    {
      _id: {
        yearMonth: "2024-08",
        treatmentCode: "PRO",
      },
      count: 10,
    },
    {
      _id: {
        yearMonth: "2024-08",
        treatmentCode: "EXO",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2024-08",
        treatmentCode: "END",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2024-09",
        treatmentCode: "RES",
      },
      count: 21,
    },
    {
      _id: {
        yearMonth: "2024-09",
        treatmentCode: "ODG",
      },
      count: 11,
    },
    {
      _id: {
        yearMonth: "2024-09",
        treatmentCode: "OTD",
      },
      count: 16,
    },
    {
      _id: {
        yearMonth: "2024-09",
        treatmentCode: "PRO",
      },
      count: 8,
    },
    {
      _id: {
        yearMonth: "2024-09",
        treatmentCode: "EXO",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2024-09",
        treatmentCode: "END",
      },
      count: 3,
    },
    {
      _id: {
        yearMonth: "2024-10",
        treatmentCode: "RES",
      },
      count: 23,
    },
    {
      _id: {
        yearMonth: "2024-10",
        treatmentCode: "ODG",
      },
      count: 12,
    },
    {
      _id: {
        yearMonth: "2024-10",
        treatmentCode: "OTD",
      },
      count: 17,
    },
    {
      _id: {
        yearMonth: "2024-10",
        treatmentCode: "PRO",
      },
      count: 9,
    },
    {
      _id: {
        yearMonth: "2024-10",
        treatmentCode: "EXO",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2024-10",
        treatmentCode: "END",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2024-11",
        treatmentCode: "RES",
      },
      count: 19,
    },
    {
      _id: {
        yearMonth: "2024-11",
        treatmentCode: "ODG",
      },
      count: 10,
    },
    {
      _id: {
        yearMonth: "2024-11",
        treatmentCode: "OTD",
      },
      count: 14,
    },
    {
      _id: {
        yearMonth: "2024-11",
        treatmentCode: "PRO",
      },
      count: 7,
    },
    {
      _id: {
        yearMonth: "2024-11",
        treatmentCode: "EXO",
      },
      count: 3,
    },
    {
      _id: {
        yearMonth: "2024-11",
        treatmentCode: "END",
      },
      count: 2,
    },
    {
      _id: {
        yearMonth: "2024-12",
        treatmentCode: "RES",
      },
      count: 16,
    },
    {
      _id: {
        yearMonth: "2024-12",
        treatmentCode: "ODG",
      },
      count: 8,
    },
    {
      _id: {
        yearMonth: "2024-12",
        treatmentCode: "OTD",
      },
      count: 12,
    },
    {
      _id: {
        yearMonth: "2024-12",
        treatmentCode: "PRO",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2024-12",
        treatmentCode: "EXO",
      },
      count: 2,
    },
    {
      _id: {
        yearMonth: "2024-12",
        treatmentCode: "END",
      },
      count: 1,
    },
    {
      _id: {
        yearMonth: "2025-01",
        treatmentCode: "RES",
      },
      count: 18,
    },
    {
      _id: {
        yearMonth: "2025-01",
        treatmentCode: "ODG",
      },
      count: 10,
    },
    {
      _id: {
        yearMonth: "2025-01",
        treatmentCode: "OTD",
      },
      count: 13,
    },
    {
      _id: {
        yearMonth: "2025-01",
        treatmentCode: "PRO",
      },
      count: 7,
    },
    {
      _id: {
        yearMonth: "2025-01",
        treatmentCode: "EXO",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2025-01",
        treatmentCode: "END",
      },
      count: 3,
    },
    {
      _id: {
        yearMonth: "2025-02",
        treatmentCode: "RES",
      },
      count: 20,
    },
    {
      _id: {
        yearMonth: "2025-02",
        treatmentCode: "ODG",
      },
      count: 11,
    },
    {
      _id: {
        yearMonth: "2025-02",
        treatmentCode: "OTD",
      },
      count: 15,
    },
    {
      _id: {
        yearMonth: "2025-02",
        treatmentCode: "PRO",
      },
      count: 8,
    },
    {
      _id: {
        yearMonth: "2025-02",
        treatmentCode: "EXO",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2025-02",
        treatmentCode: "END",
      },
      count: 4,
    },
    {
      _id: {
        yearMonth: "2025-03",
        treatmentCode: "RES",
      },
      count: 22,
    },
    {
      _id: {
        yearMonth: "2025-03",
        treatmentCode: "ODG",
      },
      count: 12,
    },
    {
      _id: {
        yearMonth: "2025-03",
        treatmentCode: "OTD",
      },
      count: 16,
    },
    {
      _id: {
        yearMonth: "2025-03",
        treatmentCode: "PRO",
      },
      count: 9,
    },
    {
      _id: {
        yearMonth: "2025-03",
        treatmentCode: "EXO",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2025-03",
        treatmentCode: "END",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2025-04",
        treatmentCode: "RES",
      },
      count: 25,
    },
    {
      _id: {
        yearMonth: "2025-04",
        treatmentCode: "ODG",
      },
      count: 14,
    },
    {
      _id: {
        yearMonth: "2025-04",
        treatmentCode: "OTD",
      },
      count: 19,
    },
    {
      _id: {
        yearMonth: "2025-04",
        treatmentCode: "PRO",
      },
      count: 10,
    },
    {
      _id: {
        yearMonth: "2025-04",
        treatmentCode: "EXO",
      },
      count: 7,
    },
    {
      _id: {
        yearMonth: "2025-04",
        treatmentCode: "END",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2025-05",
        treatmentCode: "RES",
      },
      count: 27,
    },
    {
      _id: {
        yearMonth: "2025-05",
        treatmentCode: "ODG",
      },
      count: 15,
    },
    {
      _id: {
        yearMonth: "2025-05",
        treatmentCode: "OTD",
      },
      count: 21,
    },
    {
      _id: {
        yearMonth: "2025-05",
        treatmentCode: "PRO",
      },
      count: 12,
    },
    {
      _id: {
        yearMonth: "2025-05",
        treatmentCode: "EXO",
      },
      count: 8,
    },
    {
      _id: {
        yearMonth: "2025-05",
        treatmentCode: "END",
      },
      count: 7,
    },
    {
      _id: {
        yearMonth: "2025-06",
        treatmentCode: "RES",
      },
      count: 24,
    },
    {
      _id: {
        yearMonth: "2025-06",
        treatmentCode: "ODG",
      },
      count: 13,
    },
    {
      _id: {
        yearMonth: "2025-06",
        treatmentCode: "OTD",
      },
      count: 18,
    },
    {
      _id: {
        yearMonth: "2025-06",
        treatmentCode: "PRO",
      },
      count: 10,
    },
    {
      _id: {
        yearMonth: "2025-06",
        treatmentCode: "EXO",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2025-06",
        treatmentCode: "END",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2025-07",
        treatmentCode: "RES",
      },
      count: 29,
    },
    {
      _id: {
        yearMonth: "2025-07",
        treatmentCode: "ODG",
      },
      count: 16,
    },
    {
      _id: {
        yearMonth: "2025-07",
        treatmentCode: "OTD",
      },
      count: 22,
    },
    {
      _id: {
        yearMonth: "2025-07",
        treatmentCode: "PRO",
      },
      count: 13,
    },
    {
      _id: {
        yearMonth: "2025-07",
        treatmentCode: "EXO",
      },
      count: 9,
    },
    {
      _id: {
        yearMonth: "2025-07",
        treatmentCode: "END",
      },
      count: 8,
    },
    {
      _id: {
        yearMonth: "2025-08",
        treatmentCode: "RES",
      },
      count: 26,
    },
    {
      _id: {
        yearMonth: "2025-08",
        treatmentCode: "ODG",
      },
      count: 15,
    },
    {
      _id: {
        yearMonth: "2025-08",
        treatmentCode: "OTD",
      },
      count: 20,
    },
    {
      _id: {
        yearMonth: "2025-08",
        treatmentCode: "PRO",
      },
      count: 11,
    },
    {
      _id: {
        yearMonth: "2025-08",
        treatmentCode: "EXO",
      },
      count: 7,
    },
    {
      _id: {
        yearMonth: "2025-08",
        treatmentCode: "END",
      },
      count: 6,
    },
    {
      _id: {
        yearMonth: "2025-09",
        treatmentCode: "RES",
      },
      count: 23,
    },
    {
      _id: {
        yearMonth: "2025-09",
        treatmentCode: "ODG",
      },
      count: 12,
    },
    {
      _id: {
        yearMonth: "2025-09",
        treatmentCode: "OTD",
      },
      count: 17,
    },
    {
      _id: {
        yearMonth: "2025-09",
        treatmentCode: "PRO",
      },
      count: 9,
    },
    {
      _id: {
        yearMonth: "2025-09",
        treatmentCode: "EXO",
      },
      count: 5,
    },
    {
      _id: {
        yearMonth: "2025-09",
        treatmentCode: "END",
      },
      count: 4,
    },
  ];

  const [selectedTreatments, setSelectedTreatments] = useState([
    "RES",
    "ODG",
    "OTD",
    "PRO",
    "EXO",
    "END",
  ]);

  // Color palette for treatments
  const treatmentColors: Record<string, string> = {
    RES: "#2563eb", // Blue
    ODG: "#dc2626", // Red
    OTD: "#059669", // Green
    PRO: "#d97706", // Orange
    EXO: "#7c3aed", // Purple
    END: "#db2777", // Pink
    PRI: "#0891b2", // Cyan
    EXQ: "#65a30d", // Lime
    OTP: "#c2410c", // Orange-700
    ODP: "#7c2d12", // Red-900
    PER: "#be185d", // Pink-700
    IMP: "#1e40af", // Blue-800
    PRD: "#0f766e", // Teal-700
    ODQ: "#991b1b", // Red-800
    DUD: "#6b7280", // Gray-500
    RTR: "#374151", // Gray-700
    EST: "#ec4899", // Pink-500
    NCA: "#9ca3af", // Gray-400
  };

  // Simple chart data: 12 months, 3 bars per month (one per year), each bar stacked by treatments
  const chartData = useMemo(() => {
    const monthData: Record<
      string,
      Record<string, Record<string, number>>
    > = {};

    // Group data by month and year
    rawData.forEach((item) => {
      const year = item._id.yearMonth.split("-")[0];
      const month = item._id.yearMonth.split("-")[1];
      const treatmentCode = item._id.treatmentCode;

      if (!monthData[month]) {
        monthData[month] = {};
      }
      if (!monthData[month][year]) {
        monthData[month][year] = {};
      }

      monthData[month][year][treatmentCode] =
        (monthData[month][year][treatmentCode] || 0) + item.count;
    });

    // Convert to array format: 12 months, each with 3 years
    const months = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];
    const result: any[] = [];

    months.forEach((month) => {
      const monthName = new Date(2023, parseInt(month) - 1).toLocaleString(
        "es",
        { month: "short" }
      );
      const monthDataItem: any = { month: monthName };

      // Add data for each year
      Object.keys(monthData[month] || {}).forEach((year) => {
        selectedTreatments.forEach((treatment) => {
          const key = `${year}-${treatment}`;
          monthDataItem[key] = monthData[month][year][treatment] || 0;
        });
      });

      result.push(monthDataItem);
    });

    return result;
  }, [rawData, selectedTreatments]);

  // Get unique treatments
  const allTreatments = [
    ...new Set(rawData.map((item) => item._id.treatmentCode)),
  ].filter(Boolean);

  // Get years for the chart
  const years = [
    ...new Set(rawData.map((item) => item._id.yearMonth.split("-")[0])),
  ].sort();

  // Calculate summary statistics for selected treatments
  const summaryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    selectedTreatments.forEach((treatment) => {
      const total = rawData
        .filter((item) => item._id.treatmentCode === treatment)
        .reduce((sum, item) => sum + item.count, 0);
      stats[treatment] = total;
    });
    return stats;
  }, [selectedTreatments, rawData]);

  const handleTreatmentToggle = (treatment: string) => {
    setSelectedTreatments((prev) =>
      prev.includes(treatment)
        ? prev.filter((t) => t !== treatment)
        : [...prev, treatment]
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Group data by year
      const groupedData: Record<string, any[]> = {};
      payload.forEach((entry: any) => {
        const year = entry.dataKey.split("-")[0];
        if (!groupedData[year]) {
          groupedData[year] = [];
        }
        groupedData[year].push(entry);
      });

      // Color mapping for better Safari compatibility
      const getColorForTreatment = (treatment: string) => {
        const colorMap: Record<string, string> = {
          res: "#2563eb",
          odg: "#dc2626",
          otd: "#059669",
          pro: "#d97706",
          exo: "#7c3aed",
          end: "#db2777",
          pri: "#0891b2",
          exq: "#65a30d",
          otp: "#c2410c",
          odp: "#7c2d12",
          per: "#be185d",
          imp: "#1e40af",
          prd: "#0f766e",
          odq: "#991b1b",
          dud: "#6b7280",
          rtr: "#374151",
          est: "#ec4899",
          nca: "#9ca3af",
        };
        return colorMap[treatment.toLowerCase()] || "#8884d8";
      };

      return (
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "16px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            maxWidth: "320px",
            fontSize: "14px",
            color: "#1f2937",
            zIndex: 1000,
          }}
        >
          <p
            style={{
              fontWeight: "600",
              fontSize: "18px",
              marginBottom: "12px",
              color: "#1f2937",
            }}
          >
            {`${label}`}
          </p>
          {Object.entries(groupedData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([year, entries]) => {
              // Calculate total for this year
              const yearTotal = entries
                .filter((entry) => entry.value > 0)
                .reduce((sum, entry) => sum + entry.value, 0);

              return (
                <div key={year} style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <h4
                      style={{ fontWeight: "600", color: "#1e40af", margin: 0 }}
                    >
                      {year}
                    </h4>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#374151",
                        backgroundColor: "#f3f4f6",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      Total: {yearTotal}
                    </span>
                  </div>
                  <div>
                    {entries
                      .filter((entry) => entry.value > 0)
                      .sort((a, b) => a.dataKey.localeCompare(b.dataKey))
                      .map((entry: any, index: number) => {
                        const treatment =
                          entry.dataKey.split("-")[1]?.toLowerCase() ||
                          "default";
                        return (
                          <p
                            key={index}
                            style={{
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              margin: "4px 0",
                              color: "#1f2937",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                marginRight: "8px",
                                backgroundColor:
                                  getColorForTreatment(treatment),
                              }}
                            ></span>
                            <span
                              style={{ fontWeight: "500", color: "#1f2937" }}
                            >
                              {entry.dataKey.split("-")[1]}:
                            </span>
                            <span
                              style={{ marginLeft: "4px", color: "#1f2937" }}
                            >
                              {entry.value} tratamientos
                            </span>
                          </p>
                        );
                      })}
                  </div>
                </div>
              );
            })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
        <h1
          style={{
            fontSize: "clamp(1.5rem, 4vw, 1.875rem)",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "8px",
            lineHeight: "1.2",
          }}
        >
          📊 Tratamientos Dentales por Mes y Año
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
            color: "#4b5563",
            lineHeight: "1.5",
          }}
        >
          Comparación de tratamientos por mes (3 barras por mes, una por año)
        </p>
      </div>

      {/* Treatment Selection */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "12px",
            lineHeight: "1.3",
          }}
        >
          Tratamientos ({selectedTreatments.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {allTreatments.map((treatment) => (
            <label
              key={treatment}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "4px",
                backgroundColor: selectedTreatments.includes(treatment)
                  ? "#f3f4f6"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  selectedTreatments.includes(treatment)
                    ? "#f3f4f6"
                    : "transparent";
              }}
            >
              <input
                type="checkbox"
                checked={selectedTreatments.includes(treatment)}
                onChange={() => handleTreatmentToggle(treatment)}
                style={{
                  accentColor: "#2563eb",
                  width: "16px",
                  height: "16px",
                }}
              />
              <span className="text-sm">{treatment}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "16px",
            lineHeight: "1.3",
          }}
        >
          Resumen de Tratamientos Seleccionados
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {Object.entries(summaryStats).map(([treatment, count]) => (
            <div
              key={treatment}
              className="bg-gray-50 p-4 rounded-lg text-center"
            >
              <div
                className={`w-4 h-4 rounded-full mx-auto mb-2 color-dot-${treatment.toLowerCase()}`}
              ></div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#1f2937",
                  lineHeight: "1.2",
                }}
              >
                {count}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#4b5563",
                  lineHeight: "1.4",
                }}
              >
                {treatment}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  lineHeight: "1.3",
                  marginTop: "2px",
                }}
              >
                {treatmentDescriptions[treatment] || treatment}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "16px",
            lineHeight: "1.3",
          }}
        >
          Comparación Mensual: 3 Barras por Mes (2023, 2024, 2025)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="month"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            {selectedTreatments.map((treatment) => (
              <Bar
                key={treatment}
                dataKey={`2023-${treatment}`}
                stackId="2023"
                fill={treatmentColors[treatment] || "#8884d8"}
                fillOpacity={0.8}
                name={`${treatment}`}
              />
            ))}
            {years.includes("2024") &&
              selectedTreatments.map((treatment) => (
                <Bar
                  key={`2024-${treatment}`}
                  dataKey={`2024-${treatment}`}
                  stackId="2024"
                  fill={treatmentColors[treatment] || "#8884d8"}
                  fillOpacity={0.8}
                  name={`${treatment}`}
                />
              ))}
            {years.includes("2025") &&
              selectedTreatments.map((treatment) => (
                <Bar
                  key={`2025-${treatment}`}
                  dataKey={`2025-${treatment}`}
                  stackId="2025"
                  fill={treatmentColors[treatment] || "#8884d8"}
                  fillOpacity={0.8}
                  name={`${treatment}`}
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>
            💡 <strong>Hover:</strong> Pasa el mouse sobre las barras para ver
            datos organizados por año. Cada tratamiento mantiene el mismo color.
          </p>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-6">
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "16px",
            lineHeight: "1.3",
          }}
        >
          Insights Clave para Análisis
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4
              style={{
                fontWeight: "600",
                color: "#1e40af",
                marginBottom: "8px",
                fontSize: "1rem",
                lineHeight: "1.4",
              }}
            >
              📊 Tratamientos más Frecuentes
            </h4>
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                margin: 0,
              }}
            >
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  RES:
                </strong>{" "}
                Restauración Dental - Mayor demanda
              </li>
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  ODG:
                </strong>{" "}
                Odontología General - Consultas frecuentes
              </li>
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  OTD:
                </strong>{" "}
                Ortodoncia - Tratamientos largos
              </li>
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  PRO:
                </strong>{" "}
                Prótesis Dental - Demanda constante
              </li>
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontWeight: "600",
                color: "#166534",
                marginBottom: "8px",
                fontSize: "1rem",
                lineHeight: "1.4",
              }}
            >
              📈 Análisis Disponible
            </h4>
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                margin: 0,
              }}
            >
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                •{" "}
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  Comparación Mensual:
                </strong>{" "}
                3 barras por mes (una por año)
              </li>
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                •{" "}
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  Distribución:
                </strong>{" "}
                Proporción de tratamientos por año
              </li>
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                •{" "}
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  Evolución:
                </strong>{" "}
                Crecimiento año a año por mes
              </li>
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                •{" "}
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  Estacionalidad:
                </strong>{" "}
                Patrones mensuales comparados
              </li>
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontWeight: "600",
                color: "#7c2d12",
                marginBottom: "8px",
                fontSize: "1rem",
                lineHeight: "1.4",
              }}
            >
              🎯 Recomendaciones Estratégicas
            </h4>
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                margin: 0,
              }}
            >
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                •{" "}
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  Capacidad:
                </strong>{" "}
                Enfocar recursos en RES y OTD
              </li>
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                •{" "}
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  Estacionalidad:
                </strong>{" "}
                Picos en julio-agosto
              </li>
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                •{" "}
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  Crecimiento:
                </strong>{" "}
                Monitorear tendencias año a año
              </li>
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "#1f2937",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                }}
              >
                •{" "}
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  Planificación:
                </strong>{" "}
                Anticipar demanda por especialidad
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentalTreatmentDashboard;
