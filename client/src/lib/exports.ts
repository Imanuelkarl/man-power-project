import * as XLSX from "xlsx";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Manufacturer, Questionnaire } from "./store";

function buildRows(manufacturers: Manufacturer[], questionnaires: Questionnaire[]) {
  const byId = new Map(manufacturers.map((m) => [m.id, m]));
  return questionnaires.map((q) => {
    const m = byId.get(q.manufacturerId);
    return {
      Company: m?.company ?? "-",
      State: m?.state ?? "-",
      City: m?.city ?? "-",
      Sector: m?.sectoralGroup ?? "-",
      Period: q.period,
      "Capacity Utilization (%)": q.capacityUtilization,
      "Production Value (₦)": q.productionValue,
      "Raw Materials Cost (₦)": q.rawMaterialsCost,
      "Local Sourcing (%)": q.localSourcing,
      "Total Workers": q.totalWorkers,
      "New Hires": q.newHires,
      "Workers Left": q.workersLeft,
      "Interest Rate (%)": q.interestRate,
      "Exchange Rate (₦/US$)": q.exchangeRate,
      "Electricity Hours/day": q.electricityHours,
      "Diesel Spend (₦)": q.energyDiesel,
      "Gas Spend (₦)": q.energyGas,
      "Generator Spend (₦)": q.energyGenerator,
    };
  });
}

export function exportExcel(manufacturers: Manufacturer[], questionnaires: Questionnaire[]) {
  const rows = buildRows(manufacturers, questionnaires);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "MAN Report");
  XLSX.writeFile(wb, `MAN-Economic-Review-${Date.now()}.xlsx`);
}

export function exportCSV(manufacturers: Manufacturer[], questionnaires: Questionnaire[]) {
  const rows = buildRows(manufacturers, questionnaires);
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `MAN-Economic-Review-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(manufacturers: Manufacturer[], questionnaires: Questionnaire[]) {
  const rows = buildRows(manufacturers, questionnaires);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("MAN Economic Review — Manufacturer Report", 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  const cols = rows.length ? Object.keys(rows[0]) : [];
  autoTable(doc, {
    startY: 28,
    head: [cols],
    body: rows.map((r) => cols.map((c) => (r as any)[c])),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [16, 122, 74] },
  });
  doc.save(`MAN-Economic-Review-${Date.now()}.pdf`);
}