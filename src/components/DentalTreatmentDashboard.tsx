import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  Legend,
  ReferenceLine,
  Label,
} from "recharts";
import type { TreatmentData } from "../types/treatmentData.types";
import type { MoneyData } from "../types/moneyData.types";

interface Props {
  treatmentData: TreatmentData[];
  moneyData: MoneyData[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

const DentalTreatmentDashboard = ({
  treatmentData,
  moneyData,
  onRefresh,
  isRefreshing,
}: Props) => {
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
    INT: "Odontología Integral",
    PUL: "Problemas Pulpares",
  };

  // Initialize selected treatments - include INT if present in moneyData
  const [selectedTreatments, setSelectedTreatments] = useState(() => {
    const base = [
      "RES",
      "ODG",
      "OTD",
      "PRO",
      "EXO",
      "END",
      "PRI",
      "EXQ",
      "OTP",
      "ODP",
      "PER",
      "IMP",
      "PRD",
      "ODQ",
      "RTR",
      "EST",
      "PUL", // PUL appears in both attentions and sales
    ];
    return base;
  });

  // Add INT to selected treatments if present in moneyData (INT only appears in sales)
  // Use useEffect to update when moneyData changes
  useEffect(() => {
    const hasINT = moneyData.some((item) => item._id.treatmentCode === "INT");
    if (hasINT && !selectedTreatments.includes("INT")) {
      setSelectedTreatments((prev) => [...prev, "INT"]);
    }
  }, [moneyData, selectedTreatments]);

  // Year filter for strategic analysis
  const [selectedYear, setSelectedYear] = useState<string>("all");

  // State for expand/collapse sections (Progressive Disclosure)
  const [showTemporalCharts, setShowTemporalCharts] = useState<boolean>(false);
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

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
    INT: "#f59e0b", // Amber-500
    PUL: "#8b5cf6", // Violet-500
  };

  // Simple chart data: 12 months, 3 bars per month (one per year), each bar stacked by treatments
  const chartData = useMemo(() => {
    const monthData: Record<
      string,
      Record<string, Record<string, number>>
    > = {};

    // Group data by month and year
    treatmentData.forEach((item) => {
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
      // Exclude INT from attentions chart (INT only appears in sales)
      const treatmentsForAttentions = selectedTreatments.filter(
        (t) => t !== "INT"
      );
      Object.keys(monthData[month] || {}).forEach((year) => {
        treatmentsForAttentions.forEach((treatment) => {
          const key = `${year}-${treatment}`;
          monthDataItem[key] = monthData[month][year][treatment] || 0;
        });
      });

      result.push(monthDataItem);
    });

    return result;
  }, [treatmentData, selectedTreatments]);

  // Money chart data (similar structure)
  const moneyChartData = useMemo(() => {
    const monthData: Record<
      string,
      Record<string, Record<string, number>>
    > = {};

    // Group money data by month and year
    moneyData.forEach((item) => {
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
        (monthData[month][year][treatmentCode] || 0) + item.totalAmount;
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
  }, [moneyData, selectedTreatments]);

  // Get unique treatments from both datasets
  // Include treatments from moneyData that might not be in treatmentData (e.g., INT)
  const treatmentsFromAttentions = new Set(
    treatmentData.map((item) => item._id.treatmentCode)
  );
  const treatmentsFromSales = new Set(
    moneyData.map((item) => item._id.treatmentCode)
  );
  const allTreatments = [
    ...new Set([
      ...Array.from(treatmentsFromAttentions),
      ...Array.from(treatmentsFromSales),
    ]),
  ].filter(Boolean);

  // Get years for the chart
  const years = [
    ...new Set(treatmentData.map((item) => item._id.yearMonth.split("-")[0])),
  ].sort();

  // Calculate summary statistics for selected treatments (attentions only, exclude INT)
  const summaryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    const treatmentsForAttentions = selectedTreatments.filter(
      (t) => t !== "INT"
    );
    treatmentsForAttentions.forEach((treatment) => {
      const total = treatmentData
        .filter((item) => item._id.treatmentCode === treatment)
        .reduce((sum, item) => sum + item.count, 0);
      stats[treatment] = total;
    });
    return stats;
  }, [selectedTreatments, treatmentData]);

  // Calculate money summary statistics
  const moneySummaryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    selectedTreatments.forEach((treatment) => {
      const total = moneyData
        .filter((item) => item._id.treatmentCode === treatment)
        .reduce((sum, item) => sum + item.totalAmount, 0);
      stats[treatment] = total;
    });
    return stats;
  }, [selectedTreatments, moneyData]);

  // Order treatments for attentions (by count, descending) - exclude INT
  const orderedTreatmentsForAttentions = useMemo(() => {
    return Object.entries(summaryStats)
      .sort(([, a], [, b]) => b - a) // Sort by count descending
      .map(([treatment]) => treatment);
  }, [summaryStats]);

  // Order treatments for sales (by revenue, descending) - include INT
  const orderedTreatmentsForSales = useMemo(() => {
    return Object.entries(moneySummaryStats)
      .sort(([, a], [, b]) => b - a) // Sort by revenue descending
      .map(([treatment]) => treatment);
  }, [moneySummaryStats]);

  // Calculate insights from both datasets
  const insights = useMemo(() => {
    // Top treatments by count
    const treatmentCounts = allTreatments.map((treatment) => {
      const count = treatmentData
        .filter((item) => item._id.treatmentCode === treatment)
        .reduce((sum, item) => sum + item.count, 0);
      return { treatment, count };
    });
    const topByCount = treatmentCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // Top treatments by revenue
    const treatmentRevenue = allTreatments.map((treatment) => {
      const revenue = moneyData
        .filter((item) => item._id.treatmentCode === treatment)
        .reduce((sum, item) => sum + item.totalAmount, 0);
      return { treatment, revenue };
    });
    const topByRevenue = treatmentRevenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    // Average revenue per encounter/attention
    const avgRevenuePerTreatment = allTreatments.map((treatment) => {
      const count =
        treatmentCounts.find((t) => t.treatment === treatment)?.count || 0;
      const revenue =
        treatmentRevenue.find((t) => t.treatment === treatment)?.revenue || 0;
      return {
        treatment,
        avgRevenue: count > 0 ? revenue / count : 0,
        count,
        revenue,
      };
    });
    const topByAvgRevenue = avgRevenuePerTreatment
      .filter((t) => t.count > 0)
      .sort((a, b) => b.avgRevenue - a.avgRevenue)
      .slice(0, 3);

    // Total statistics - only include revenue from treatments that have encounters
    const totalTreatments = treatmentData.reduce(
      (sum, item) => sum + item.count,
      0
    );
    // Only sum revenue for treatment codes that exist in treatmentData (have encounters)
    const treatmentCodesWithEncounters = new Set(
      treatmentData.map((item) => item._id.treatmentCode)
    );
    const totalRevenue = moneyData
      .filter((item) =>
        treatmentCodesWithEncounters.has(item._id.treatmentCode)
      )
      .reduce((sum, item) => sum + item.totalAmount, 0);
    const overallAvgRevenue =
      totalTreatments > 0 ? totalRevenue / totalTreatments : 0;

    return {
      topByCount,
      topByRevenue,
      topByAvgRevenue,
      totalTreatments,
      totalRevenue,
      overallAvgRevenue,
    };
  }, [treatmentData, moneyData, allTreatments]);

  // Strategic Analysis: Quadrant Matrix, Scatter Plot, and Analysis Table
  const strategicAnalysis = useMemo(() => {
    // Filter data by selected year
    const filteredTreatmentData =
      selectedYear === "all"
        ? treatmentData
        : treatmentData.filter((item) => {
            const year = item._id.yearMonth.split("-")[0];
            return year === selectedYear;
          });

    const filteredMoneyData =
      selectedYear === "all"
        ? moneyData
        : moneyData.filter((item) => {
            const year = item._id.yearMonth.split("-")[0];
            return year === selectedYear;
          });

    // Get complete data for all treatments (only those with encounters)
    const treatmentCodesWithEncounters = new Set(
      filteredTreatmentData.map((item) => item._id.treatmentCode)
    );
    const analysisData = allTreatments
      .filter((treatment) => treatmentCodesWithEncounters.has(treatment))
      .map((treatment) => {
        const count = filteredTreatmentData
          .filter((item) => item._id.treatmentCode === treatment)
          .reduce((sum, item) => sum + item.count, 0);
        const revenue = filteredMoneyData
          .filter((item) => item._id.treatmentCode === treatment)
          .reduce((sum, item) => sum + item.totalAmount, 0);
        const avgRevenue = count > 0 ? revenue / count : 0;
        const totalTreatments = filteredTreatmentData.reduce(
          (sum, item) => sum + item.count,
          0
        );
        const totalRevenue = filteredMoneyData
          .filter((item) =>
            treatmentCodesWithEncounters.has(item._id.treatmentCode)
          )
          .reduce((sum, item) => sum + item.totalAmount, 0);

        return {
          treatment,
          count,
          revenue,
          avgRevenue,
          countPercentage:
            totalTreatments > 0 ? (count / totalTreatments) * 100 : 0,
          revenuePercentage:
            totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
        };
      })
      .filter((item) => item.count > 0); // Only treatments with actual encounters

    // Calculate medians and averages for quadrant division
    const counts = analysisData.map((d) => d.count).sort((a, b) => a - b);
    const revenues = analysisData.map((d) => d.revenue).sort((a, b) => a - b);
    const avgRevenues = analysisData
      .map((d) => d.avgRevenue)
      .sort((a, b) => a - b);
    const medianCount =
      counts.length > 0 ? counts[Math.floor(counts.length / 2)] : 0;
    const medianRevenue =
      revenues.length > 0 ? revenues[Math.floor(revenues.length / 2)] : 0;
    const medianAvgRevenue =
      avgRevenues.length > 0
        ? avgRevenues[Math.floor(avgRevenues.length / 2)]
        : 0;
    const avgCount =
      counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
    const avgRevenue =
      revenues.length > 0
        ? revenues.reduce((a, b) => a + b, 0) / revenues.length
        : 0;

    // Classify treatments into quadrants
    const quadrants = {
      stars: [] as typeof analysisData, // High volume, High revenue
      optimize: [] as typeof analysisData, // High volume, Low revenue
      grow: [] as typeof analysisData, // Low volume, High revenue
      review: [] as typeof analysisData, // Low volume, Low revenue
    };

    analysisData.forEach((item) => {
      const isHighVolume = item.count >= medianCount;
      const isHighRevenue = item.revenue >= medianRevenue;

      if (isHighVolume && isHighRevenue) {
        quadrants.stars.push(item);
      } else if (isHighVolume && !isHighRevenue) {
        quadrants.optimize.push(item);
      } else if (!isHighVolume && isHighRevenue) {
        quadrants.grow.push(item);
      } else {
        quadrants.review.push(item);
      }
    });

    // Sort each quadrant by revenue (descending), then by volume (descending) if revenue is equal
    Object.keys(quadrants).forEach((key) => {
      quadrants[key as keyof typeof quadrants].sort((a, b) => {
        if (b.revenue !== a.revenue) {
          return b.revenue - a.revenue; // Sort by revenue first
        }
        return b.count - a.count; // Then by volume
      });
    });

    return {
      data: analysisData,
      quadrants,
      medianCount,
      medianRevenue,
      medianAvgRevenue,
      avgCount,
      avgRevenue,
    };
  }, [treatmentData, moneyData, allTreatments, selectedYear]);

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
          int: "#f59e0b",
          pul: "#8b5cf6",
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
                              {entry.value} atenciones
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
          📊 Dashboard de Análisis Dental
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
            color: "#4b5563",
            lineHeight: "1.5",
          }}
        >
          Vista ejecutiva de atenciones, ingresos y oportunidades estratégicas
        </p>
        {/* Botón de actualización flotante - NO interfiere con el layout original */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            backgroundColor: isRefreshing ? "#9ca3af" : "#2563eb",
            color: "#ffffff",
            fontWeight: "600",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: isRefreshing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            transition: "all 0.2s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            if (!isRefreshing) {
              e.currentTarget.style.backgroundColor = "#1e40af";
              e.currentTarget.style.boxShadow = "0 6px 8px rgba(0,0,0,0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isRefreshing) {
              e.currentTarget.style.backgroundColor = "#2563eb";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
            }
          }}
          title={
            isRefreshing ? "Actualizando..." : "Actualizar datos desde MongoDB"
          }
        >
          <span
            style={{
              display: "inline-block",
              transform: isRefreshing ? "rotate(360deg)" : "rotate(0deg)",
              transition: "transform 0.6s linear",
            }}
          >
            🔄
          </span>
          <span>{isRefreshing ? "Actualizando..." : "Actualizar"}</span>
        </button>
      </div>

      {/* HERO SECTION - 4 KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI 1: Total Atenciones */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div className="text-3xl">👥</div>
            <div className="text-xs bg-blue-400 bg-opacity-50 px-2 py-1 rounded">
              Volumen
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">
            {insights?.totalTreatments?.toLocaleString("es-MX") || "0"}
          </div>
          <div className="text-sm opacity-90">Atenciones Totales</div>
        </div>

        {/* KPI 2: Total Ingresos */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div className="text-3xl">💰</div>
            <div className="text-xs bg-green-400 bg-opacity-50 px-2 py-1 rounded">
              Ingresos
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">
            $
            {insights?.totalRevenue
              ? (insights.totalRevenue / 1000).toFixed(0)
              : "0"}
            k
          </div>
          <div className="text-sm opacity-90">MXN en Total</div>
        </div>

        {/* KPI 3: Promedio por Atención */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div className="text-3xl">📊</div>
            <div className="text-xs bg-purple-400 bg-opacity-50 px-2 py-1 rounded">
              Eficiencia
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">
            $
            {insights?.overallAvgRevenue?.toLocaleString("es-MX", {
              maximumFractionDigits: 0,
            }) || "0"}
          </div>
          <div className="text-sm opacity-90">MXN por Atención</div>
        </div>

        {/* KPI 4: Top Procedimiento */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div className="text-3xl">⭐</div>
            <div className="text-xs bg-orange-400 bg-opacity-50 px-2 py-1 rounded">
              Más Frecuente
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">
            {insights?.topByCount?.[0]?.treatment || "N/A"}
          </div>
          <div className="text-sm opacity-90">
            {insights?.topByCount?.[0]?.count?.toLocaleString("es-MX") || "0"}{" "}
            atenciones
          </div>
        </div>
      </div>

      {/* Strategic Analysis Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-6">
        <h2
          style={{
            fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "8px",
            lineHeight: "1.2",
          }}
        >
          📈 Análisis Estratégico: Volumen vs. Ingresos
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            marginBottom: "24px",
          }}
        >
          Visualiza la relación entre volumen de atenciones e ingresos para
          optimizar estrategias
        </p>

        {/* How to Read Guide */}
        <div
          style={{
            backgroundColor: "#f0f9ff",
            border: "2px solid #bfdbfe",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "24px",
          }}
        >
          <details>
            <summary
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#1e40af",
                cursor: "pointer",
                userSelect: "none",
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>📖</span>
              <span>¿Cómo leer esta matriz? (Click para expandir)</span>
            </summary>
            <div
              style={{
                marginTop: "16px",
                fontSize: "0.875rem",
                color: "#374151",
                lineHeight: "1.6",
              }}
            >
              <p
                style={{
                  marginBottom: "12px",
                  fontWeight: "600",
                  color: "#1e40af",
                }}
              >
                La matriz te ayuda a tomar decisiones estratégicas comparando la
                frecuencia de atenciones por tipo de procedimiento principal vs.
                los ingresos generados por cada tipo de atención.
              </p>

              <div style={{ marginBottom: "16px" }}>
                <h4
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  🔢 ¿Cómo se calculan los números?
                </h4>
                <ol style={{ marginLeft: "20px", marginBottom: "0" }}>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Volumen:</strong> Contamos cuántas atenciones se
                    registraron con cada procedimiento principal (ej: RES = 549
                    atenciones)
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Ingresos:</strong> Sumamos todo lo vendido/ingresado
                    por servicios de ese procedimiento (ej: RES = $442,250 MXN
                    en total)
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Promedio por atención:</strong> Dividimos ingresos ÷
                    volumen para saber cuánto genera cada atención de ese tipo
                    (ej: RES = $442,250 ÷ 549 = $806 por atención)
                  </li>
                </ol>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <h4
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  📊 ¿Qué es el "Valor Típico"?
                </h4>
                <p style={{ marginBottom: "8px" }}>
                  Imagina que ordenas todos los{" "}
                  <strong>tipos de procedimiento</strong> de menor a mayor. El{" "}
                  <strong>"valor típico" (mediana)</strong> es el que queda
                  justo en el medio:
                </p>
                <ul style={{ marginLeft: "20px", marginBottom: "0" }}>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Volumen típico = 76 atenciones:</strong> La mitad de
                    los procedimientos se realiza en más de 76 atenciones, la
                    otra mitad en menos de 76
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Ingreso típico = $590 por atención:</strong> La
                    mitad de los procedimientos genera más de $590 por atención,
                    la otra mitad menos
                  </li>
                </ul>
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "0.8125rem",
                    color: "#6b7280",
                    fontStyle: "italic",
                  }}
                >
                  💡 Usamos el "valor típico" en lugar del promedio porque evita
                  que procedimientos muy frecuentes (como RES con 549
                  atenciones) distorsionen el análisis.
                </p>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  🎯 ¿Cómo interpretar los cuadrantes?
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#dcfce7",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#166534",
                        marginBottom: "4px",
                      }}
                    >
                      ⭐ Estrellas
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#374151" }}>
                      Alto volumen + Alto ingreso.
                      <br />
                      <strong>Acción:</strong> Mantener y potenciar
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#fef3c7",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#92400e",
                        marginBottom: "4px",
                      }}
                    >
                      🔧 Optimizar
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#374151" }}>
                      Alto volumen + Bajo ingreso.
                      <br />
                      <strong>Acción:</strong> Revisar precios
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#dbeafe",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#1e40af",
                        marginBottom: "4px",
                      }}
                    >
                      📈 Crecimiento
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#374151" }}>
                      Bajo volumen + Alto ingreso.
                      <br />
                      <strong>Acción:</strong> Expandir demanda
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#f3f4f6",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "4px",
                      }}
                    >
                      🔍 Revisar
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#374151" }}>
                      Bajo volumen + Bajo ingreso.
                      <br />
                      <strong>Acción:</strong> Evaluar estrategia
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  backgroundColor: "#f0fdf4",
                  borderRadius: "8px",
                  border: "1px solid #bbf7d0",
                }}
              >
                <p
                  style={{ margin: 0, fontSize: "0.8125rem", color: "#166534" }}
                >
                  <strong>💡 Ejemplo:</strong> Si RES muestra "vs Típico $590:
                  +37%", significa que cada atención con RES como procedimiento
                  principal genera $806 en promedio, que es 37% más que el
                  ingreso típico por atención ($590). Esto indica que las
                  atenciones de RES son más rentables que la mayoría de
                  procedimientos.
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* Quadrant Matrix - Main Executive View */}
        <div className="mb-8">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#1f2937",
                margin: 0,
              }}
            >
              🎯 Matriz de Cuadrantes (Vista Ejecutiva)
            </h3>
            {/* Year Selector */}
            <div style={{ display: "flex", gap: "8px" }}>
              {["all", "2023", "2024", "2025"].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.875rem",
                    fontWeight: selectedYear === year ? "600" : "500",
                    color: selectedYear === year ? "#ffffff" : "#6b7280",
                    backgroundColor:
                      selectedYear === year ? "#2563eb" : "#ffffff",
                    border:
                      selectedYear === year ? "none" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedYear !== year) {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                      e.currentTarget.style.borderColor = "#9ca3af";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedYear !== year) {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }
                  }}
                >
                  {year === "all" ? "Todos" : year}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {/* Quadrant 1: Stars (High Volume, High Revenue) */}
            <div
              style={{
                background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "2px solid #10b981",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h4
                    style={{
                      fontWeight: "700",
                      color: "#065f46",
                      marginBottom: "4px",
                      fontSize: "1.125rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>⭐</span>
                    Estrellas
                  </h4>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#047857",
                      margin: 0,
                      fontWeight: "500",
                    }}
                  >
                    Alto volumen • Alto ingreso
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "2px",
                      }}
                    >
                      Total Ingresos
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "700",
                        color: "#065f46",
                      }}
                    >
                      $
                      {(
                        strategicAnalysis.quadrants.stars.reduce(
                          (sum, item) => sum + item.revenue,
                          0
                        ) / 1000
                      ).toFixed(0)}
                      k
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "2px",
                      }}
                    >
                      Total Volumen
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "700",
                        color: "#065f46",
                      }}
                    >
                      {strategicAnalysis.quadrants.stars.reduce(
                        (sum, item) => sum + item.count,
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {strategicAnalysis.quadrants.stars.map((item) => (
                  <div
                    key={item.treatment}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor:
                            treatmentColors[item.treatment] || "#1f2937",
                          marginRight: "10px",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <strong
                            style={{ color: "#1f2937", fontSize: "1rem" }}
                          >
                            {item.treatment}
                          </strong>
                          <span
                            style={{ fontSize: "0.875rem", color: "#6b7280" }}
                          >
                            {treatmentDescriptions[item.treatment] ||
                              item.treatment}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        paddingLeft: "22px",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#f3f4f6",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Vol: <strong>{item.count}</strong>
                      </span>
                      <span
                        style={{
                          backgroundColor: "#dcfce7",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#166534",
                        }}
                      >
                        Ing:{" "}
                        <strong>${(item.revenue / 1000).toFixed(0)}k</strong>
                      </span>
                      <span
                        style={{
                          backgroundColor: "#dbeafe",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#1e40af",
                        }}
                      >
                        Prom:{" "}
                        <strong>
                          $
                          {item.avgRevenue.toLocaleString("es-MX", {
                            maximumFractionDigits: 0,
                          })}
                        </strong>
                      </span>
                      <span
                        style={{
                          backgroundColor:
                            item.avgRevenue >=
                            strategicAnalysis.medianAvgRevenue
                              ? "#dcfce7"
                              : "#fee2e2",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color:
                            item.avgRevenue >=
                            strategicAnalysis.medianAvgRevenue
                              ? "#166534"
                              : "#dc2626",
                        }}
                      >
                        {strategicAnalysis.medianAvgRevenue === 0
                          ? "N/A"
                          : `vs Típico $${strategicAnalysis.medianAvgRevenue.toLocaleString("es-MX", { maximumFractionDigits: 0 })}: ${((item.avgRevenue - strategicAnalysis.medianAvgRevenue) / strategicAnalysis.medianAvgRevenue) * 100 >= 0 ? "+" : ""}${(((item.avgRevenue - strategicAnalysis.medianAvgRevenue) / strategicAnalysis.medianAvgRevenue) * 100).toFixed(0)}%`}
                      </span>
                    </div>
                  </div>
                ))}
                {strategicAnalysis.quadrants.stars.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      fontStyle: "italic",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    Ningún tratamiento en este cuadrante
                  </p>
                )}
              </div>
            </div>

            {/* Quadrant 2: Optimize (High Volume, Low Revenue) */}
            <div
              style={{
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "2px solid #f59e0b",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h4
                    style={{
                      fontWeight: "700",
                      color: "#92400e",
                      marginBottom: "4px",
                      fontSize: "1.125rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>🔧</span>
                    Optimizar Precios
                  </h4>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#b45309",
                      margin: 0,
                      fontWeight: "500",
                    }}
                  >
                    Alto volumen • Bajo ingreso
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "2px",
                      }}
                    >
                      Total Ingresos
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "700",
                        color: "#92400e",
                      }}
                    >
                      $
                      {(
                        strategicAnalysis.quadrants.optimize.reduce(
                          (sum, item) => sum + item.revenue,
                          0
                        ) / 1000
                      ).toFixed(0)}
                      k
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "2px",
                      }}
                    >
                      Total Volumen
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "700",
                        color: "#92400e",
                      }}
                    >
                      {strategicAnalysis.quadrants.optimize.reduce(
                        (sum, item) => sum + item.count,
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {strategicAnalysis.quadrants.optimize.map((item) => (
                  <div
                    key={item.treatment}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor:
                            treatmentColors[item.treatment] || "#1f2937",
                          marginRight: "10px",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <strong
                            style={{ color: "#1f2937", fontSize: "1rem" }}
                          >
                            {item.treatment}
                          </strong>
                          <span
                            style={{ fontSize: "0.875rem", color: "#6b7280" }}
                          >
                            {treatmentDescriptions[item.treatment] ||
                              item.treatment}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        paddingLeft: "22px",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#f3f4f6",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Vol: <strong>{item.count}</strong>
                      </span>
                      <span
                        style={{
                          backgroundColor: "#fed7aa",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#92400e",
                        }}
                      >
                        Ing:{" "}
                        <strong>${(item.revenue / 1000).toFixed(0)}k</strong>
                      </span>
                      <span
                        style={{
                          backgroundColor: "#dbeafe",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#1e40af",
                        }}
                      >
                        Prom:{" "}
                        <strong>
                          $
                          {item.avgRevenue.toLocaleString("es-MX", {
                            maximumFractionDigits: 0,
                          })}
                        </strong>
                      </span>
                      <span
                        style={{
                          backgroundColor:
                            item.avgRevenue >=
                            strategicAnalysis.medianAvgRevenue
                              ? "#dcfce7"
                              : "#fee2e2",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color:
                            item.avgRevenue >=
                            strategicAnalysis.medianAvgRevenue
                              ? "#166534"
                              : "#dc2626",
                        }}
                      >
                        {strategicAnalysis.medianAvgRevenue === 0
                          ? "N/A"
                          : `vs Típico $${strategicAnalysis.medianAvgRevenue.toLocaleString("es-MX", { maximumFractionDigits: 0 })}: ${((item.avgRevenue - strategicAnalysis.medianAvgRevenue) / strategicAnalysis.medianAvgRevenue) * 100 >= 0 ? "+" : ""}${(((item.avgRevenue - strategicAnalysis.medianAvgRevenue) / strategicAnalysis.medianAvgRevenue) * 100).toFixed(0)}%`}
                      </span>
                    </div>
                  </div>
                ))}
                {strategicAnalysis.quadrants.optimize.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      fontStyle: "italic",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    Ningún tratamiento en este cuadrante
                  </p>
                )}
              </div>
            </div>

            {/* Quadrant 3: Grow (Low Volume, High Revenue) */}
            <div
              style={{
                background: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "2px solid #3b82f6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h4
                    style={{
                      fontWeight: "700",
                      color: "#1e40af",
                      marginBottom: "4px",
                      fontSize: "1.125rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>📈</span>
                    Oportunidades de Crecimiento
                  </h4>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#1d4ed8",
                      margin: 0,
                      fontWeight: "500",
                    }}
                  >
                    Bajo volumen • Alto ingreso
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "2px",
                      }}
                    >
                      Total Ingresos
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "700",
                        color: "#1e40af",
                      }}
                    >
                      $
                      {(
                        strategicAnalysis.quadrants.grow.reduce(
                          (sum, item) => sum + item.revenue,
                          0
                        ) / 1000
                      ).toFixed(0)}
                      k
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "2px",
                      }}
                    >
                      Total Volumen
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "700",
                        color: "#1e40af",
                      }}
                    >
                      {strategicAnalysis.quadrants.grow.reduce(
                        (sum, item) => sum + item.count,
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {strategicAnalysis.quadrants.grow.map((item) => (
                  <div
                    key={item.treatment}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor:
                            treatmentColors[item.treatment] || "#1f2937",
                          marginRight: "10px",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <strong
                            style={{ color: "#1f2937", fontSize: "1rem" }}
                          >
                            {item.treatment}
                          </strong>
                          <span
                            style={{ fontSize: "0.875rem", color: "#6b7280" }}
                          >
                            {treatmentDescriptions[item.treatment] ||
                              item.treatment}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        paddingLeft: "22px",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#f3f4f6",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Vol: <strong>{item.count}</strong>
                      </span>
                      <span
                        style={{
                          backgroundColor: "#bfdbfe",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#1e40af",
                        }}
                      >
                        Ing:{" "}
                        <strong>${(item.revenue / 1000).toFixed(0)}k</strong>
                      </span>
                      <span
                        style={{
                          backgroundColor: "#dbeafe",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#1e40af",
                        }}
                      >
                        Prom:{" "}
                        <strong>
                          $
                          {item.avgRevenue.toLocaleString("es-MX", {
                            maximumFractionDigits: 0,
                          })}
                        </strong>
                      </span>
                      <span
                        style={{
                          backgroundColor:
                            item.avgRevenue >=
                            strategicAnalysis.medianAvgRevenue
                              ? "#dcfce7"
                              : "#fee2e2",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color:
                            item.avgRevenue >=
                            strategicAnalysis.medianAvgRevenue
                              ? "#166534"
                              : "#dc2626",
                        }}
                      >
                        {strategicAnalysis.medianAvgRevenue === 0
                          ? "N/A"
                          : `vs Típico $${strategicAnalysis.medianAvgRevenue.toLocaleString("es-MX", { maximumFractionDigits: 0 })}: ${((item.avgRevenue - strategicAnalysis.medianAvgRevenue) / strategicAnalysis.medianAvgRevenue) * 100 >= 0 ? "+" : ""}${(((item.avgRevenue - strategicAnalysis.medianAvgRevenue) / strategicAnalysis.medianAvgRevenue) * 100).toFixed(0)}%`}
                      </span>
                    </div>
                  </div>
                ))}
                {strategicAnalysis.quadrants.grow.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      fontStyle: "italic",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    Ningún tratamiento en este cuadrante
                  </p>
                )}
              </div>
            </div>

            {/* Quadrant 4: Review (Low Volume, Low Revenue) */}
            <div
              style={{
                background: "linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "2px solid #9ca3af",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h4
                    style={{
                      fontWeight: "700",
                      color: "#374151",
                      marginBottom: "4px",
                      fontSize: "1.125rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>🔍</span>
                    Revisar Estrategia
                  </h4>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      margin: 0,
                      fontWeight: "500",
                    }}
                  >
                    Bajo volumen • Bajo ingreso
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "2px",
                      }}
                    >
                      Total Ingresos
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "700",
                        color: "#374151",
                      }}
                    >
                      $
                      {(
                        strategicAnalysis.quadrants.review.reduce(
                          (sum, item) => sum + item.revenue,
                          0
                        ) / 1000
                      ).toFixed(0)}
                      k
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "2px",
                      }}
                    >
                      Total Volumen
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "700",
                        color: "#374151",
                      }}
                    >
                      {strategicAnalysis.quadrants.review.reduce(
                        (sum, item) => sum + item.count,
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {strategicAnalysis.quadrants.review.map((item) => (
                  <div
                    key={item.treatment}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor:
                            treatmentColors[item.treatment] || "#1f2937",
                          marginRight: "10px",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <strong
                            style={{ color: "#1f2937", fontSize: "1rem" }}
                          >
                            {item.treatment}
                          </strong>
                          <span
                            style={{ fontSize: "0.875rem", color: "#6b7280" }}
                          >
                            {treatmentDescriptions[item.treatment] ||
                              item.treatment}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        paddingLeft: "22px",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#f3f4f6",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Vol: <strong>{item.count}</strong>
                      </span>
                      <span
                        style={{
                          backgroundColor: "#e5e7eb",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#4b5563",
                        }}
                      >
                        Ing:{" "}
                        <strong>${(item.revenue / 1000).toFixed(0)}k</strong>
                      </span>
                      <span
                        style={{
                          backgroundColor: "#dbeafe",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: "#1e40af",
                        }}
                      >
                        Prom:{" "}
                        <strong>
                          $
                          {item.avgRevenue.toLocaleString("es-MX", {
                            maximumFractionDigits: 0,
                          })}
                        </strong>
                      </span>
                      <span
                        style={{
                          backgroundColor:
                            item.avgRevenue >=
                            strategicAnalysis.medianAvgRevenue
                              ? "#dcfce7"
                              : "#fee2e2",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color:
                            item.avgRevenue >=
                            strategicAnalysis.medianAvgRevenue
                              ? "#166534"
                              : "#dc2626",
                        }}
                      >
                        {strategicAnalysis.medianAvgRevenue === 0
                          ? "N/A"
                          : `vs Típico $${strategicAnalysis.medianAvgRevenue.toLocaleString("es-MX", { maximumFractionDigits: 0 })}: ${((item.avgRevenue - strategicAnalysis.medianAvgRevenue) / strategicAnalysis.medianAvgRevenue) * 100 >= 0 ? "+" : ""}${(((item.avgRevenue - strategicAnalysis.medianAvgRevenue) / strategicAnalysis.medianAvgRevenue) * 100).toFixed(0)}%`}
                      </span>
                    </div>
                  </div>
                ))}
                {strategicAnalysis.quadrants.review.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      fontStyle: "italic",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    Ningún tratamiento en este cuadrante
                  </p>
                )}
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: "700",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              📊 Punto Medio (Valores Típicos)
            </h4>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "#6b7280",
                marginBottom: "16px",
                fontStyle: "italic",
              }}
            >
              Estos valores dividen los tratamientos en dos grupos iguales: 50%
              arriba y 50% abajo
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Valor Típico
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      Volumen:
                    </span>
                    <span
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      {strategicAnalysis.medianCount.toLocaleString("es-MX")}{" "}
                      atenciones
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      Ingresos:
                    </span>
                    <span
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      $
                      {strategicAnalysis.medianRevenue.toLocaleString("es-MX", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      MXN
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      Promedio/atención:
                    </span>
                    <span
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: "600",
                        color: "#2563eb",
                      }}
                    >
                      $
                      {strategicAnalysis.medianAvgRevenue.toLocaleString(
                        "es-MX",
                        { maximumFractionDigits: 0 }
                      )}{" "}
                      MXN
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Promedio
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      Volumen:
                    </span>
                    <span
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      {strategicAnalysis.avgCount.toLocaleString("es-MX", {
                        maximumFractionDigits: 1,
                      })}{" "}
                      atenciones
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      Ingresos:
                    </span>
                    <span
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      $
                      {strategicAnalysis.avgRevenue.toLocaleString("es-MX", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      MXN
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scatter Plot - Deep Dive */}
        <div className="mb-8">
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "8px",
            }}
          >
            📊 Scatter Plot: Volumen vs. Ingresos
          </h3>
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#eff6ff",
              borderRadius: "8px",
              border: "1px solid #bfdbfe",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                color: "#1e40af",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              📍 Guía de Interpretación:
            </p>
            <div style={{ fontSize: "0.75rem", color: "#1e3a8a" }}>
              <p style={{ margin: "4px 0" }}>
                <strong>⭐ Arriba-Derecha (Verde):</strong> Estrellas - Alto
                volumen y alto ingreso. Mantener y potenciar.
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>🔧 Abajo-Derecha (Amarillo):</strong> Optimizar - Alto
                volumen pero bajo ingreso. Revisar precios.
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>📈 Arriba-Izquierda (Azul):</strong> Crecimiento - Bajo
                volumen pero alto ingreso. Oportunidad de expandir.
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>🔍 Abajo-Izquierda (Gris):</strong> Revisar - Bajo
                volumen y bajo ingreso. Evaluar estrategia.
              </p>
              <p
                style={{
                  margin: "8px 0 0 0",
                  paddingTop: "8px",
                  borderTop: "1px solid #bfdbfe",
                  fontStyle: "italic",
                }}
              >
                Las líneas punteadas muestran las medianas que dividen los
                cuadrantes.
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                type="number"
                dataKey="count"
                name="Volumen de Atenciones"
                label={{
                  value: "Volumen de Atenciones",
                  position: "insideBottom",
                  offset: -10,
                }}
                domain={["dataMin - 10", "dataMax + 10"]}
              />
              <YAxis
                type="number"
                dataKey="revenue"
                name="Ingresos Totales"
                label={{
                  value: "Ingresos Totales (MXN)",
                  angle: -90,
                  position: "insideLeft",
                }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                domain={["dataMin - 50000", "dataMax + 50000"]}
              />
              {/* Reference lines for medians */}
              <ReferenceLine
                x={strategicAnalysis.medianCount}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: "Mediana Volumen",
                  position: "top",
                  fill: "#ef4444",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={strategicAnalysis.medianRevenue}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: "Mediana Ingresos",
                  position: "right",
                  fill: "#ef4444",
                  fontSize: 12,
                }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const quadrant =
                      data.count >= strategicAnalysis.medianCount &&
                      data.revenue >= strategicAnalysis.medianRevenue
                        ? "⭐ Estrellas"
                        : data.count >= strategicAnalysis.medianCount &&
                            data.revenue < strategicAnalysis.medianRevenue
                          ? "🔧 Optimizar"
                          : data.count < strategicAnalysis.medianCount &&
                              data.revenue >= strategicAnalysis.medianRevenue
                            ? "📈 Crecimiento"
                            : "🔍 Revisar";
                    return (
                      <div
                        style={{
                          backgroundColor: "#ffffff",
                          padding: "12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <p
                          style={{
                            fontWeight: "600",
                            marginBottom: "4px",
                            fontSize: "0.875rem",
                          }}
                        >
                          {data.treatment} - {quadrant}
                        </p>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            marginBottom: "4px",
                          }}
                        >
                          {treatmentDescriptions[data.treatment] ||
                            data.treatment}
                        </p>
                        <p style={{ fontSize: "0.875rem", margin: "2px 0" }}>
                          Volumen: {data.count.toLocaleString("es-MX")}{" "}
                          atenciones
                        </p>
                        <p style={{ fontSize: "0.875rem", margin: "2px 0" }}>
                          Ingresos: $
                          {data.revenue.toLocaleString("es-MX", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          MXN
                        </p>
                        <p style={{ fontSize: "0.875rem", margin: "2px 0" }}>
                          Promedio: $
                          {data.avgRevenue.toLocaleString("es-MX", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          MXN/atención
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Scatter
                name="Tratamientos"
                data={strategicAnalysis.data}
                fill="#8884d8"
              >
                {strategicAnalysis.data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={treatmentColors[entry.treatment] || "#8884d8"}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Analysis Table - Detailed Metrics */}
        <div>
          <button
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span
              style={{
                transform: isTableExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                display: "inline-block",
              }}
            >
              ▶
            </span>
            📋 Tabla de Análisis Detallado
          </button>
          {isTableExpanded && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.875rem",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6" }}>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        border: "1px solid #e5e7eb",
                        fontWeight: "600",
                      }}
                    >
                      Tratamiento
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        border: "1px solid #e5e7eb",
                        fontWeight: "600",
                      }}
                    >
                      Volumen
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        border: "1px solid #e5e7eb",
                        fontWeight: "600",
                      }}
                    >
                      % Volumen
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        border: "1px solid #e5e7eb",
                        fontWeight: "600",
                      }}
                    >
                      Ingresos
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        border: "1px solid #e5e7eb",
                        fontWeight: "600",
                      }}
                    >
                      % Ingresos
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        border: "1px solid #e5e7eb",
                        fontWeight: "600",
                      }}
                    >
                      Promedio/Atención
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        border: "1px solid #e5e7eb",
                        fontWeight: "600",
                      }}
                    >
                      vs Valor Típico
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        border: "1px solid #e5e7eb",
                        fontWeight: "600",
                      }}
                    >
                      Cuadrante
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {strategicAnalysis.data
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((item) => {
                      const quadrant =
                        item.count >= strategicAnalysis.medianCount &&
                        item.revenue >= strategicAnalysis.medianRevenue
                          ? "⭐ Estrellas"
                          : item.count >= strategicAnalysis.medianCount &&
                              item.revenue < strategicAnalysis.medianRevenue
                            ? "🔧 Optimizar"
                            : item.count < strategicAnalysis.medianCount &&
                                item.revenue >= strategicAnalysis.medianRevenue
                              ? "📈 Crecimiento"
                              : "🔍 Revisar";
                      return (
                        <tr
                          key={item.treatment}
                          style={{ borderBottom: "1px solid #e5e7eb" }}
                        >
                          <td
                            style={{
                              padding: "12px",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                backgroundColor:
                                  treatmentColors[item.treatment] || "#8884d8",
                                marginRight: "8px",
                              }}
                            />
                            <strong>{item.treatment}</strong>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {item.count.toLocaleString("es-MX")}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {item.countPercentage.toFixed(1)}%
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            $
                            {item.revenue.toLocaleString("es-MX", {
                              maximumFractionDigits: 0,
                            })}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {item.revenuePercentage.toFixed(1)}%
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            $
                            {item.avgRevenue.toLocaleString("es-MX", {
                              maximumFractionDigits: 0,
                            })}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <div
                              style={{ fontSize: "0.8rem", color: "#6b7280" }}
                            >
                              Típico: $
                              {strategicAnalysis.medianAvgRevenue.toLocaleString(
                                "es-MX",
                                { maximumFractionDigits: 0 }
                              )}
                            </div>
                            <span
                              style={{
                                color:
                                  item.avgRevenue >=
                                  strategicAnalysis.medianAvgRevenue
                                    ? "#166534"
                                    : "#dc2626",
                                fontWeight: "600",
                                fontSize: "0.85rem",
                              }}
                            >
                              (
                              {item.avgRevenue >=
                              strategicAnalysis.medianAvgRevenue
                                ? "+"
                                : ""}
                              $
                              {(
                                item.avgRevenue -
                                strategicAnalysis.medianAvgRevenue
                              ).toLocaleString("es-MX", {
                                maximumFractionDigits: 0,
                              })}
                              )
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.75rem",
                            }}
                          >
                            {quadrant}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
          Tipos de Atención ({selectedTreatments.length})
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
          Resumen de Atenciones Seleccionadas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {orderedTreatmentsForAttentions.map((treatment) => {
            const count = summaryStats[treatment] || 0;
            return (
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
            );
          })}
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
            {orderedTreatmentsForAttentions.map((treatment) => (
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
              orderedTreatmentsForAttentions.map((treatment) => (
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
              orderedTreatmentsForAttentions.map((treatment) => (
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
            datos organizados por año. Cada tipo de atención mantiene el mismo
            color.
          </p>
        </div>
      </div>

      {/* Money Data Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-6">
        <h2
          style={{
            fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "8px",
            lineHeight: "1.2",
          }}
        >
          💰 Ingresos por Atención (Servicios Vendidos)
        </h2>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
            color: "#4b5563",
            lineHeight: "1.5",
            marginBottom: "24px",
          }}
        >
          Comparación de ingresos por mes (3 barras por mes, una por año)
        </p>

        {/* Money Summary Statistics */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "16px",
              lineHeight: "1.3",
            }}
          >
            Resumen de Ingresos por Atención
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {orderedTreatmentsForSales.map((treatment) => {
              const amount = moneySummaryStats[treatment] || 0;
              return (
                <div
                  key={treatment}
                  className="bg-white p-4 rounded-lg text-center border border-gray-200"
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
                    $
                    {amount.toLocaleString("es-MX", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
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
              );
            })}
          </div>
        </div>

        {/* Money Chart */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "16px",
              lineHeight: "1.3",
            }}
          >
            Comparación Mensual de Ingresos: 3 Barras por Mes (2023, 2024, 2025)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={moneyChartData}
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
              <YAxis
                tickFormatter={(value) =>
                  `$${value.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const groupedData: Record<string, any[]> = {};
                    payload.forEach((entry: any) => {
                      const year = entry.dataKey.split("-")[0];
                      if (!groupedData[year]) {
                        groupedData[year] = [];
                      }
                      groupedData[year].push(entry);
                    });

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
                            const yearTotal = entries
                              .filter((entry: any) => entry.value > 0)
                              .reduce(
                                (sum: number, entry: any) => sum + entry.value,
                                0
                              );

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
                                    style={{
                                      fontWeight: "600",
                                      color: "#1e40af",
                                      margin: 0,
                                    }}
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
                                    Total: $
                                    {yearTotal.toLocaleString("es-MX", {
                                      maximumFractionDigits: 0,
                                    })}
                                  </span>
                                </div>
                                <div>
                                  {entries
                                    .filter((entry: any) => entry.value > 0)
                                    .sort((a: any, b: any) =>
                                      a.dataKey.localeCompare(b.dataKey)
                                    )
                                    .map((entry: any, index: number) => {
                                      const treatment =
                                        entry.dataKey
                                          .split("-")[1]
                                          ?.toLowerCase() || "default";
                                      const getColorForTreatment = (
                                        t: string
                                      ) => {
                                        const colorMap: Record<string, string> =
                                          {
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
                                            int: "#f59e0b",
                                            pul: "#8b5cf6",
                                          };
                                        return (
                                          colorMap[t.toLowerCase()] || "#8884d8"
                                        );
                                      };
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
                                            style={{
                                              fontWeight: "500",
                                              color: "#1f2937",
                                            }}
                                          >
                                            {entry.dataKey.split("-")[1]}:
                                          </span>
                                          <span
                                            style={{
                                              marginLeft: "4px",
                                              color: "#1f2937",
                                            }}
                                          >
                                            $
                                            {entry.value.toLocaleString(
                                              "es-MX",
                                              { maximumFractionDigits: 0 }
                                            )}
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
                }}
              />
              {orderedTreatmentsForSales.map((treatment) => (
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
                orderedTreatmentsForSales.map((treatment) => (
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
                orderedTreatmentsForSales.map((treatment) => (
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
              ingresos organizados por año. Cada tipo de atención mantiene el
              mismo color.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentalTreatmentDashboard;
