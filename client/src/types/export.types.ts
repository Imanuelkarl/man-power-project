// src/types/export.types.ts

export interface ExportParameter {
  id: string;
  label: string;
  category: 'manufacturer' | 'questionnaire' | 'cluster' | 'derived';
  getValue: (data: ExportDataContext) => any;
  format?: (value: any) => string;
}

export interface ExportDataContext {
  manufacturer: any;
  questionnaire: any;
  cluster: any;
  clusterStats: any;
}

export interface ExportConfig {
  parameters: string[]; // Array of parameter IDs
  format: 'excel' | 'csv' | 'pdf';
  clusterIds?: string[]; // Optional: specific clusters to export
}

export interface ClusterExportSummary {
  clusterName: string;
  clusterId: string;
  geoType: string;
  powerLevel: string;
  companyCount: number;
  manufacturerIds: number[];
}