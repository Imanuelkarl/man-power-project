// src/lib/cluster-export.ts

import * as XLSX from "xlsx";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PowerData } from "../types/powerData.types";
import type { Manufacturer } from "../types/manufacturer.types";
import type { ClusterWithStats } from "../types/cluster.types";
import type {  ExportDataContext } from "../types/export.types";
import { getParameterById } from "./export-parameters";

interface ExportRow {
  [key: string]: any;
}

export function buildExportRows(
  clusters: ClusterWithStats[],
  manufacturers: Manufacturer[],
  questionnaires: PowerData[],
  selectedParameters: string[]
): ExportRow[] {
  const rows: ExportRow[] = [];
  const manufacturerMap = new Map(manufacturers.map(m => [m.id, m]));
  const questionnaireMap = new Map<number, PowerData[]>();
  
  // Group questionnaires by manufacturerId
  questionnaires.forEach(q => {
    if (!questionnaireMap.has(q.manufacturerId)) {
      questionnaireMap.set(q.manufacturerId, []);
    }
    questionnaireMap.get(q.manufacturerId)!.push(q);
  });

  clusters.forEach(cluster => {
    // Get all manufacturers in this cluster
    const clusterManufacturers = cluster.manufacturerIds
      .map(id => manufacturerMap.get(id))
      .filter((m): m is Manufacturer => m !== undefined);

    // For each manufacturer, get their latest questionnaire data
    clusterManufacturers.forEach(manufacturer => {
      const qs = questionnaireMap.get(manufacturer.id) || [];
      const latestQ = qs.length > 0 ? qs.reduce((a, b) => 
        new Date(a.submittedAt) > new Date(b.submittedAt) ? a : b
      ) : null;

      const context: ExportDataContext = {
        manufacturer,
        questionnaire: latestQ,
        cluster: cluster,
        clusterStats: {
          companyCount: clusterManufacturers.length,
          totalEnergySpend: cluster.totalEnergySpendNaira,
          totalEnergyConsumed: cluster.totalEnergyConsumedKwh,
          avgCapacityUtilization: cluster.avgEnergyConsumedKwh
        }
      };

      const row: ExportRow = {
        _clusterId: cluster.id,
        _clusterName: cluster.name,
        _manufacturerId: manufacturer.id
      };

      selectedParameters.forEach(paramId => {
        const param = getParameterById(paramId);
        if (param) {
          let value = param.getValue(context);
          if (param.format && value !== undefined && value !== null) {
            value = param.format(value);
          }
          row[paramId] = value ?? '-';
        }
      });

      rows.push(row);
    });
  });

  return rows;
}

export function exportClustersExcel(
  clusters: ClusterWithStats[],
  manufacturers: Manufacturer[],
  questionnaires: PowerData[],
  selectedParameters: string[],
  filename?: string
) {
  const rows = buildExportRows(clusters, manufacturers, questionnaires, selectedParameters);
  
  // Remove internal fields
  const exportRows = rows.map(row => {
    const { _clusterId, _clusterName, _manufacturerId, ...rest } = row;
    return rest;
  });

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cluster Data");
  
  // Auto-size columns
  const colWidths = Object.keys(exportRows[0] || {}).map(key => ({
    wch: Math.max(key.length, 20)
  }));
  ws['!cols'] = colWidths;

  const fileName = filename || `Cluster-Export-${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportClustersCSV(
  clusters: ClusterWithStats[],
  manufacturers: Manufacturer[],
  questionnaires: PowerData[],
  selectedParameters: string[],
  filename?: string
) {
  const rows = buildExportRows(clusters, manufacturers, questionnaires, selectedParameters);
  
  // Remove internal fields
  const exportRows = rows.map(row => {
    const { _clusterId, _clusterName, _manufacturerId, ...rest } = row;
    return rest;
  });

  const csv = Papa.unparse(exportRows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `Cluster-Export-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportClustersPDF(
  clusters: ClusterWithStats[],
  manufacturers: Manufacturer[],
  questionnaires: PowerData[],
  selectedParameters: string[],
  filename?: string
) {
  const rows = buildExportRows(clusters, manufacturers, questionnaires, selectedParameters);
  
  // Remove internal fields
  const exportRows = rows.map(row => {
    const { _clusterId, _clusterName, _manufacturerId, ...rest } = row;
    return rest;
  });

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("Cluster Export Report", 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
  doc.text(`Total Companies: ${exportRows.length}`, 14, 28);

  const cols = exportRows.length ? Object.keys(exportRows[0]) : [];
  const paramLabels = cols.map(colId => {
    const param = getParameterById(colId);
    return param?.label || colId;
  });

  autoTable(doc, {
    startY: 32,
    head: [paramLabels],
    body: exportRows.map(row => cols.map(col => row[col] || '-')),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [16, 122, 74] },
    columnStyles: {
      ...(cols.reduce((acc, col, idx) => {
        // Make text columns wider
        if (['company_name', 'cluster_name'].includes(col)) {
          acc[idx] = { cellWidth: 30 };
        }
        return acc;
      }, {} as any))
    }
  });

  const fileName = filename || `Cluster-Export-${Date.now()}.pdf`;
  doc.save(fileName);
}