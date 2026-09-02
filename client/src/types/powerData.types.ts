export interface PowerData {
  id: number;
  manufacturerId: string;
  period: string; // e.g. "H1 2026"
  startTime: Date;
  endTime: Date;
  capacityUtilization: number;
  productionValue: number;
  totalEnergyGenerated: number;
  totalEnergyConsumed: number;
  energyGeneratedByGas?: number;
  energyGeneratedByDiesel?: number;
  energyGeneratedByGenerator?: number;
  energyGeneratedByOther?: number;
  rawMaterialsCost: number;
  rawMaterialsTransport: number;
  localSourcing: number;
  unsoldGoods: number;
  newHires: number;
  totalWorkers: number;
  workersLeft: number;
  interestRate: number;
  exchangeRate: number;
  investLandBuildings: number;
  investPlant: number;
  investFurniture: number;
  investVehicles: number;
  investInProgress: number;
  electricityHours: number;
  powerOutages: number;
  energyDiesel: number;
  energyGas: number;
  energyGenerator: number;
  energyOther: number;
  nigeriaFirstComment: string;
  submittedAt: string;
  submittedBy: string;
  status?: "draft" | "submitted";
}
