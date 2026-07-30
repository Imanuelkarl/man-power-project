// src/lib/export-parameters.ts

import type { ExportParameter } from "../types/export.types";

// Helper formatters
const formatNaira = (value: number) => {
  return new Intl.NumberFormat('en-NG', { 
    style: 'currency', 
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const formatNumber = (value: number) => {
  return value.toLocaleString();
};

// Parameter definitions
export const EXPORT_PARAMETERS: ExportParameter[] = [
  // Cluster info
  {
    id: 'cluster_name',
    label: 'Cluster Name',
    category: 'cluster',
    getValue: (ctx) => ctx.cluster?.name || '-'
  },
  {
    id: 'cluster_type',
    label: 'Cluster Type',
    category: 'cluster',
    getValue: (ctx) => ctx.cluster?.geoType || '-'
  },
  {
    id: 'power_level',
    label: 'Power Level',
    category: 'cluster',
    getValue: (ctx) => ctx.cluster?.powerLevel || '-'
  },
  {
    id: 'company_count',
    label: 'Number of Companies',
    category: 'derived',
    getValue: (ctx) => ctx.clusterStats?.companyCount || 0
  },

  // Manufacturer info
  {
    id: 'company_name',
    label: 'Company Name',
    category: 'manufacturer',
    getValue: (ctx) => ctx.manufacturer?.name || '-'
  },
  {
    id: 'contact_person',
    label: 'Contact Person',
    category: 'manufacturer',
    getValue: (ctx) => ctx.manufacturer?.contact_person || '-'
  },
  {
    id: 'email',
    label: 'Email',
    category: 'manufacturer',
    getValue: (ctx) => ctx.manufacturer?.email || '-'
  },
  {
    id: 'phone',
    label: 'Phone',
    category: 'manufacturer',
    getValue: (ctx) => ctx.manufacturer?.phone || '-'
  },
  {
    id: 'state',
    label: 'State',
    category: 'manufacturer',
    getValue: (ctx) => ctx.manufacturer?.state || '-'
  },
  {
    id: 'city',
    label: 'City/LGA',
    category: 'manufacturer',
    getValue: (ctx) => ctx.manufacturer?.city || '-'
  },
  {
    id: 'sectoral_group',
    label: 'Sectoral Group',
    category: 'manufacturer',
    getValue: (ctx) => ctx.manufacturer?.sectoral_group || '-'
  },
  {
    id: 'sub_sector',
    label: 'Sub Sector',
    category: 'manufacturer',
    getValue: (ctx) => ctx.manufacturer?.sub_sector || '-'
  },

  // Questionnaire - Production & Capacity
  {
    id: 'period',
    label: 'Reporting Period',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.period || '-'
  },
  {
    id: 'capacity_utilization',
    label: 'Capacity Utilization (%)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.capacityUtilization || 0,
    format: formatPercent
  },
  {
    id: 'production_value',
    label: 'Production Value (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.productionValue || 0,
    format: formatNaira
  },

  // Energy
  {
    id: 'total_energy_generated',
    label: 'Total Energy Generated (kWh)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.totalEnergyGenerated || 0,
    format: formatNumber
  },
  {
    id: 'total_energy_consumed',
    label: 'Total Energy Consumed (kWh)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.totalEnergyConsumed || 0,
    format: formatNumber
  },
  {
    id: 'energy_gas',
    label: 'Energy from Gas (kWh)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.energyGeneratedByGas || 0,
    format: formatNumber
  },
  {
    id: 'energy_diesel',
    label: 'Energy from Diesel (kWh)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.energyGeneratedByDiesel || 0,
    format: formatNumber
  },
  {
    id: 'energy_generator',
    label: 'Energy from Generator (kWh)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.energyGeneratedByGenerator || 0,
    format: formatNumber
  },
  {
    id: 'energy_other',
    label: 'Energy from Other Sources (kWh)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.energyGeneratedByOther || 0,
    format: formatNumber
  },

  // Costs & Spending
  {
    id: 'raw_materials_cost',
    label: 'Raw Materials Cost (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.rawMaterialsCost || 0,
    format: formatNaira
  },
  {
    id: 'raw_materials_transport',
    label: 'Raw Materials Transport (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.rawMaterialsTransport || 0,
    format: formatNaira
  },
  {
    id: 'local_sourcing',
    label: 'Local Sourcing (%)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.localSourcing || 0,
    format: formatPercent
  },
  {
    id: 'unsold_goods',
    label: 'Unsold Goods Value (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.unsoldGoods || 0,
    format: formatNaira
  },

  // Workforce
  {
    id: 'total_workers',
    label: 'Total Workers',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.totalWorkers || 0,
    format: formatNumber
  },
  {
    id: 'new_hires',
    label: 'New Hires',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.newHires || 0,
    format: formatNumber
  },
  {
    id: 'workers_left',
    label: 'Workers Left',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.workersLeft || 0,
    format: formatNumber
  },

  // Economic Indicators
  {
    id: 'interest_rate',
    label: 'Interest Rate (%)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.interestRate || 0,
    format: formatPercent
  },
  {
    id: 'exchange_rate',
    label: 'Exchange Rate (₦/US$)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.exchangeRate || 0,
    format: formatNumber
  },

  // Investments
  {
    id: 'invest_land_buildings',
    label: 'Investment - Land & Buildings (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.investLandBuildings || 0,
    format: formatNaira
  },
  {
    id: 'invest_plant',
    label: 'Investment - Plant & Machinery (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.investPlant || 0,
    format: formatNaira
  },
  {
    id: 'invest_furniture',
    label: 'Investment - Furniture & Fittings (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.investFurniture || 0,
    format: formatNaira
  },
  {
    id: 'invest_vehicles',
    label: 'Investment - Vehicles (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.investVehicles || 0,
    format: formatNaira
  },
  {
    id: 'invest_in_progress',
    label: 'Investment - Work in Progress (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.investInProgress || 0,
    format: formatNaira
  },

  // Power & Electricity
  {
    id: 'electricity_hours',
    label: 'Electricity Hours per Day',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.electricityHours || 0,
    format: formatNumber
  },
  {
    id: 'power_outages',
    label: 'Power Outages',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.powerOutages || 0,
    format: formatNumber
  },
  {
    id: 'energy_diesel_spend',
    label: 'Diesel Energy Spend (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.energyDiesel || 0,
    format: formatNaira
  },
  {
    id: 'energy_gas_spend',
    label: 'Gas Energy Spend (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.energyGas || 0,
    format: formatNaira
  },
  {
    id: 'energy_generator_spend',
    label: 'Generator Energy Spend (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.energyGenerator || 0,
    format: formatNaira
  },
  {
    id: 'energy_other_spend',
    label: 'Other Energy Spend (₦)',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.energyOther || 0,
    format: formatNaira
  },

  // Metadata
  {
    id: 'submitted_at',
    label: 'Date Submitted',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.submittedAt 
      ? new Date(ctx.questionnaire.submittedAt).toLocaleDateString() 
      : '-'
  },
  {
    id: 'submitted_by',
    label: 'Submitted By',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.submittedBy || '-'
  },
  {
    id: 'nigeria_first_comment',
    label: 'Nigeria First Comments',
    category: 'questionnaire',
    getValue: (ctx) => ctx.questionnaire?.nigeriaFirstComment || '-'
  }
];

// Group parameters by category for UI
export const PARAMETER_CATEGORIES = {
  cluster: 'Cluster',
  manufacturer: 'Company Information',
  questionnaire: 'Power Data',
};

export const getParametersByCategory = (category: string) => {
  return EXPORT_PARAMETERS.filter(p => p.category === category);
};

export const getParameterById = (id: string) => {
  return EXPORT_PARAMETERS.find(p => p.id === id);
};