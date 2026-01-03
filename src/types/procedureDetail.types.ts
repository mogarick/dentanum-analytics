// ============================================
// FILTROS Y CONTEXTO
// ============================================

export interface ProcedureDetailFilters {
  /** Código del procedimiento (obligatorio) */
  procedureCode: string;

  /** Año (opcional, formato: "2024") */
  year?: string;

  /** Mes (opcional, formato: "01"-"12") */
  month?: string;

  /** Día (opcional, formato: "01"-"31") */
  day?: string;

  /** Owner account (siempre "MGyL1bJHV1DK") */
  ownerAccount: string;

  /** Página para infinite scroll */
  page?: number;

  /** Registros por página */
  limit?: number;
}

export interface DrillDownContext {
  /** Código del procedimiento */
  procedureCode: string;

  /** Nombre del procedimiento para display */
  procedureName?: string;

  /** Filtros pre-poblados desde el contexto */
  year?: string;
  month?: string;
  day?: string;
}

// ============================================
// REGISTROS DE BASE DE DATOS
// ============================================

export interface AttentionRecord {
  _id: string;
  patientId: string; // P#xxxxxxxx
  startDate: Date;
  procedureCode: string;
  procedureDescription: string;
  reason: string; // name
  note: string;
  patientAge: number | "ND";
}

export interface SaleRecord {
  _id: string;
  subjectId: string; // P#xxxxxxxx
  date: Date;
  procedureCode: string;
  procedureDescription: string;
  amount: number; // value (absoluto)
  patientAge: number | "ND";
}

// ============================================
// REGISTROS CONSOLIDADOS
// ============================================

export type ConciliationStatus =
  | "perfect-match" // ✅ Atención + Venta (≤3h diferencia)
  | "likely-match" // 🟡 Atención + Venta (>3h, mismo día)
  | "attention-only" // ⚠️ Solo Atención
  | "sale-only"; // ❌ Solo Venta

export interface ConsolidatedRecord {
  id: string; // ID único para React keys
  patientId: string; // Anonimizado (ej: "****6f1M")
  patientAge: number | "ND";
  date: Date; // Fecha principal (de atención o venta)

  /** Datos de atención (si existe) */
  attention?: {
    _id: string;
    time: string; // "09:30" (HH:mm)
    procedureCode: string;
    procedureDescription: string;
    reason: string;
    note: string;
  };

  /** Datos de venta (si existe) */
  sale?: {
    _id: string;
    time: string; // "09:45" (HH:mm)
    procedureCode: string;
    procedureDescription: string;
    amount: number;
  };

  /** Estado de conciliación */
  conciliationStatus: ConciliationStatus;

  /** Diferencia en minutos entre atención y venta (si ambas existen) */
  timeDifferenceMinutes?: number;
}

// ============================================
// RESPUESTA PAGINADA
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasMore: boolean;
    limit: number;
  };
}

export interface ConsolidatedResponse
  extends PaginatedResponse<ConsolidatedRecord> {
  /** Métricas de conciliación */
  stats: ConciliationStats;
}

// ============================================
// ESTADÍSTICAS
// ============================================

export interface ConciliationStats {
  totalRecords: number;
  perfectMatches: number;
  likelyMatches: number;
  attentionOnly: number;
  saleOnly: number;
  totalRevenue: number;
  averageRevenue: number;
  averageAge: number | "ND";
  conciliationRate: number; // % de atenciones con venta
  dateRange: {
    start: Date;
    end: Date;
  };
}

// ============================================
// PROPS DE COMPONENTES
// ============================================

export interface ProcedureDetailPageProps {
  // No recibe props - usa useParams() y useSearchParams()
}

export interface RecordListItemProps {
  record: ConsolidatedRecord;
  isMobile: boolean;
}

export interface NoteFieldProps {
  note: string;
  isMobile: boolean;
  maxLines?: number;
}

export interface ProcedureDetailHeaderProps {
  procedureCode: string;
  procedureName: string;
  stats: ConciliationStats;
  onFilterChange: (filters: any) => void;
}









