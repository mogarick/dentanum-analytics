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
import type { TreatmentData } from "../types/treatmentData.types";
import type { MoneyData } from "../types/moneyData.types";

interface Props {
  treatmentData: TreatmentData[];
  moneyData: MoneyData[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

const DentalTreatmentDashboard = ({ treatmentData, moneyData, onRefresh, isRefreshing }: Props) => {
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


  const [selectedTreatments, setSelectedTreatments] = useState([
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
      Object.keys(monthData[month] || {}).forEach((year) => {
        selectedTreatments.forEach((treatment) => {
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
      "01", "02", "03", "04", "05", "06",
      "07", "08", "09", "10", "11", "12",
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

  // Get unique treatments
  const allTreatments = [
    ...new Set(treatmentData.map((item) => item._id.treatmentCode)),
  ].filter(Boolean);

  // Get years for the chart
  const years = [
    ...new Set(treatmentData.map((item) => item._id.yearMonth.split("-")[0])),
  ].sort();

  // Calculate summary statistics for selected treatments
  const summaryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    selectedTreatments.forEach((treatment) => {
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
      const count = treatmentCounts.find((t) => t.treatment === treatment)?.count || 0;
      const revenue = treatmentRevenue.find((t) => t.treatment === treatment)?.revenue || 0;
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
    const totalTreatments = treatmentData.reduce((sum, item) => sum + item.count, 0);
    // Only sum revenue for treatment codes that exist in treatmentData (have encounters)
    const treatmentCodesWithEncounters = new Set(treatmentData.map((item) => item._id.treatmentCode));
    const totalRevenue = moneyData
      .filter((item) => treatmentCodesWithEncounters.has(item._id.treatmentCode))
      .reduce((sum, item) => sum + item.totalAmount, 0);
    const overallAvgRevenue = totalTreatments > 0 ? totalRevenue / totalTreatments : 0;

    return {
      topByCount,
      topByRevenue,
      topByAvgRevenue,
      totalTreatments,
      totalRevenue,
      overallAvgRevenue,
    };
  }, [treatmentData, moneyData, allTreatments]);

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
          📊 Atenciones Dentales por Mes y Año
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
            color: "#4b5563",
            lineHeight: "1.5",
          }}
        >
          Comparación de atenciones por mes (3 barras por mes, una por año)
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
          title={isRefreshing ? "Actualizando..." : "Actualizar datos desde MongoDB"}
        >
          <span style={{ 
            display: "inline-block", 
            transform: isRefreshing ? "rotate(360deg)" : "rotate(0deg)",
            transition: "transform 0.6s linear",
          }}>
            🔄
          </span>
          <span>{isRefreshing ? "Actualizando..." : "Actualizar"}</span>
        </button>
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
            datos organizados por año. Cada tipo de atención mantiene el mismo color.
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
            {Object.entries(moneySummaryStats).map(([treatment, amount]) => (
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
                  ${amount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                tickFormatter={(value) => `$${value.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`}
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
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                          maxWidth: "320px",
                          fontSize: "14px",
                          color: "#1f2937",
                          zIndex: 1000,
                        }}
                      >
                        <p style={{ fontWeight: "600", fontSize: "18px", marginBottom: "12px", color: "#1f2937" }}>
                          {`${label}`}
                        </p>
                        {Object.entries(groupedData)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([year, entries]) => {
                            const yearTotal = entries
                              .filter((entry: any) => entry.value > 0)
                              .reduce((sum: number, entry: any) => sum + entry.value, 0);

                            return (
                              <div key={year} style={{ marginBottom: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                                  <h4 style={{ fontWeight: "600", color: "#1e40af", margin: 0 }}>{year}</h4>
                                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#374151", backgroundColor: "#f3f4f6", padding: "4px 8px", borderRadius: "4px" }}>
                                    Total: ${yearTotal.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div>
                                  {entries
                                    .filter((entry: any) => entry.value > 0)
                                    .sort((a: any, b: any) => a.dataKey.localeCompare(b.dataKey))
                                    .map((entry: any, index: number) => {
                                      const treatment = entry.dataKey.split("-")[1]?.toLowerCase() || "default";
                                      const getColorForTreatment = (t: string) => {
                                        const colorMap: Record<string, string> = {
                                          res: "#2563eb", odg: "#dc2626", otd: "#059669", pro: "#d97706",
                                          exo: "#7c3aed", end: "#db2777", pri: "#0891b2", exq: "#65a30d",
                                          otp: "#c2410c", odp: "#7c2d12", per: "#be185d", imp: "#1e40af",
                                          prd: "#0f766e", odq: "#991b1b", dud: "#6b7280", rtr: "#374151",
                                          est: "#ec4899", nca: "#9ca3af",
                                        };
                                        return colorMap[t.toLowerCase()] || "#8884d8";
                                      };
                                      return (
                                        <p key={index} style={{ fontSize: "14px", display: "flex", alignItems: "center", margin: "4px 0", color: "#1f2937" }}>
                                          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", marginRight: "8px", backgroundColor: getColorForTreatment(treatment) }}></span>
                                          <span style={{ fontWeight: "500", color: "#1f2937" }}>{entry.dataKey.split("-")[1]}:</span>
                                          <span style={{ marginLeft: "4px", color: "#1f2937" }}>
                                            ${entry.value.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
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
              ingresos organizados por año. Cada tipo de atención mantiene el mismo color.
            </p>
          </div>
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
              📊 Atenciones más Frecuentes
            </h4>
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {insights.topByCount.map((item, index) => (
                <li
                  key={item.treatment}
                  style={{
                    fontSize: "0.875rem",
                    color: "#1f2937",
                    marginBottom: "4px",
                    lineHeight: "1.4",
                  }}
                >
                  <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                    {item.treatment}:
                  </strong>{" "}
                  {treatmentDescriptions[item.treatment] || item.treatment} - {item.count.toLocaleString('es-MX')} atenciones
                </li>
              ))}
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
              💰 Atenciones con Mayor Ingreso
            </h4>
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {insights.topByRevenue.map((item) => (
                <li
                  key={item.treatment}
                  style={{
                    fontSize: "0.875rem",
                    color: "#1f2937",
                    marginBottom: "4px",
                    lineHeight: "1.4",
                  }}
                >
                  <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                    {item.treatment}:
                  </strong>{" "}
                  ${item.revenue.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "4px" }}>
                <strong>Total Ingresos:</strong> ${insights.totalRevenue.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN
              </p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                <strong>Promedio por Atención:</strong> ${insights.overallAvgRevenue.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN
              </p>
            </div>
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
              🎯 Atenciones más Rentables
            </h4>
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {insights.topByAvgRevenue.map((item) => (
                <li
                  key={item.treatment}
                  style={{
                    fontSize: "0.875rem",
                    color: "#1f2937",
                    marginBottom: "4px",
                    lineHeight: "1.4",
                  }}
                >
                  <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                    {item.treatment}:
                  </strong>{" "}
                  ${item.avgRevenue.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN promedio
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "4px" }}>
                    ({item.count} atenciones)
                  </span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "4px" }}>
                <strong>Total Atenciones:</strong> {insights.totalTreatments.toLocaleString('es-MX')}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                <strong>Análisis:</strong> Compara volumen vs. ingresos para optimizar estrategia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentalTreatmentDashboard;
