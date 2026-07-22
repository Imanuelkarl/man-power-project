import type { Manufacturer } from "../types/manufacturer.types";
import type { PowerData } from "./store";
import { NIGERIAN_STATES, SECTORAL_GROUPS } from "./store";

const COMPANY_PREFIXES = [
  "Zenith",
  "Coral",
  "Green Leaf",
  "Sahara",
  "Niger",
  "Trans",
  "Delta",
  "Golden",
  "Royal",
  "Prime",
  "Apex",
  "Union",
  "First",
  "Meridian",
  "Vanguard",
  "Kola",
  "Ade",
  "Oba",
  "Emeka",
  "Yaba",
  "Ikeja",
  "Cross",
  "Tiger",
  "Falcon",
  "Chi",
];
const COMPANY_SUFFIXES = [
  "Industries Ltd",
  "Manufacturing Plc",
  "Foods Ltd",
  "Chemicals Ltd",
  "Steel Works",
  "Textiles Ltd",
  "Plastics Ltd",
  "Beverages Nig. Ltd",
  "Cement Plc",
  "Pharma Ltd",
  "Electricals Ltd",
  "Motors Ltd",
];
const FIRST_NAMES = [
  "Adaeze",
  "Chinedu",
  "Fatima",
  "Emeka",
  "Ngozi",
  "Yusuf",
  "Bola",
  "Tunde",
  "Amina",
  "Ifeoma",
  "Musa",
  "Kemi",
];
const LAST_NAMES = [
  "Okafor",
  "Adeyemi",
  "Bello",
  "Eze",
  "Ibrahim",
  "Okonkwo",
  "Adekunle",
  "Musa",
  "Balogun",
  "Nwosu",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function rand(min: number, max: number, decimals = 0) {
  const v = Math.random() * (max - min) + min;
  const p = Math.pow(10, decimals);
  return Math.round(v * p) / p;
}
function slug() {
  return Math.random().toString(36).slice(2, 10);
}

export function generateManufacturer(
  id: number,
  users: any[] = [],
  usedEmails: Set<string> = new Set(),
): Manufacturer {
  const loc = pick(NIGERIAN_STATES);
  const jitter = () => (Math.random() - 0.5) * 0.12; // ~13km
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const companyName = `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)}`;
  const group = pick(SECTORAL_GROUPS);
  const availableUserEmails = users
    .map((user) => user.email)
    .filter(
      (email): email is string => Boolean(email) && !usedEmails.has(email),
    );
  let email =
    availableUserEmails.length > 0
      ? pick(availableUserEmails)
      : `${first.toLowerCase()}.${last.toLowerCase()}@${companyName.split(" ")[0].toLowerCase()}.ng`;

  while (usedEmails.has(email)) {
    email = `${first.toLowerCase()}.${last.toLowerCase()}-${slug()}@${companyName.split(" ")[0].toLowerCase()}.ng`;
  }
  usedEmails.add(email);

  return {
    id,
    company: companyName,
    contactPerson: `${first} ${last}`,
    email,
    phone: `+2348${rand(10000000, 99999999)}`,
    branch: loc.city,
    sectoralGroup: group,
    subSector: group.split(" ")[0],
    state: loc.state,
    city: loc.city,
    lat: loc.lat + jitter(),
    lng: loc.lng + jitter(),
    createdAt: new Date().toISOString(),
  };
}

export function generateQuestionnaire(
  manufacturerId: number,
  period = "H1 2026",
): PowerData {
  return {
    id: `q-${slug()}`,
    manufacturerId,
    period,
    startTime: new Date("2026-01-01"),
    endTime: new Date("2026-07-01"),
    capacityUtilization: rand(30, 85, 1),
    productionValue: rand(50_000_000, 5_000_000_000),
    rawMaterialsCost: rand(20_000_000, 2_000_000_000),
    rawMaterialsTransport: rand(1_000_000, 100_000_000),
    localSourcing: rand(20, 90, 1),
    unsoldGoods: rand(5_000_000, 500_000_000),
    newHires: rand(0, 50),
    totalWorkers: rand(20, 1500),
    workersLeft: rand(0, 40),
    interestRate: rand(18, 35, 2),
    exchangeRate: rand(1450, 1650, 2),
    investLandBuildings: rand(0, 500_000_000),
    investPlant: rand(0, 800_000_000),
    investFurniture: rand(0, 50_000_000),
    investVehicles: rand(0, 100_000_000),
    investInProgress: rand(0, 200_000_000),
    electricityHours: rand(2, 14, 1),
    powerOutages: rand(2, 10),
    energyDiesel: rand(5_000_000, 300_000_000),
    energyGas: rand(0, 150_000_000),
    energyGenerator: rand(1_000_000, 80_000_000),
    energyOther: rand(0, 40_000_000),
    nigeriaFirstComment:
      "Modest improvement in government patronage observed, though procurement lead times remain long.",
    submittedAt: new Date().toISOString(),
    submittedBy: FIRST_NAMES[rand(0, 10)] + " " + LAST_NAMES[rand(0, 9)],
  };
}

export function generateBatch(count: number, users: any[] = []) {
  const manufacturers: Manufacturer[] = [];
  const questionnaires: PowerData[] = [];
  const usedEmails = new Set<string>();
  for (let i = 0; i < count; i++) {
    const m = generateManufacturer(i, users, usedEmails);
    manufacturers.push(m);
    questionnaires.push(generateQuestionnaire(m.id));
  }
  return { manufacturers, questionnaires };
}
