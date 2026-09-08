import { Prisma } from "../generated/prisma/client.js";
import prisma from "./prisma.service.js";

export type ClusterInput = {
  id: string;
  name: string;
  description?: string;
  geoType: string;
  regions: string[];
  states: string[];
  lgas: string[];
  wards: string[];
  manufacturerIds?: number[];
  focalPoint?: { lat: number; lng: number; label: string };
  radiusKm?: number;
  createdAt?: string;
  updatedAt?: string;
};

const definitionFields = (input: ClusterInput) => ({
  name: input.name.trim(),
  description: input.description?.trim() || null,
  geoType: input.geoType,
  regions: input.regions,
  states: input.states,
  lgas: input.lgas,
  wards: input.wards,
  focalPoint: input.focalPoint ?? Prisma.JsonNull,
  radiusKm: input.radiusKm ?? null,
});

type StoredCluster = {
  id: string;
  name: string;
  description: string | null;
  geoType: string;
  regions: unknown;
  states: unknown;
  lgas: unknown;
  wards: unknown;
  focalPoint: unknown;
  radiusKm: number | null;
  createdAt: Date;
  updatedAt: Date;
};

const toDefinition = (cluster: StoredCluster | null) => {
  if (!cluster) return null;
  return {
    id: cluster.id,
    name: cluster.name,
    description: cluster.description ?? undefined,
    geoType: cluster.geoType,
    regions: cluster.regions as string[],
    states: cluster.states as string[],
    lgas: cluster.lgas as string[],
    wards: cluster.wards as string[],
    manufacturerIds: [],
    focalPoint: cluster.focalPoint as
      { lat: number; lng: number; label: string } | undefined,
    radiusKm: cluster.radiusKm ?? undefined,
    createdAt: cluster.createdAt.toISOString(),
    updatedAt: cluster.updatedAt.toISOString(),
  };
};

export class ClusterService {
  static async findAll(ownerUserId: string, isAdmin: boolean) {
    const clusters = await prisma.cluster.findMany({
      where: isAdmin ? undefined : { ownerUserId },
      orderBy: { updatedAt: "desc" },
    });
    return clusters.map((cluster) => toDefinition(cluster));
  }

  static async create(ownerUserId: string, input: ClusterInput) {
    const cluster = await prisma.cluster.create({
      data: {
        id: input.id,
        ownerUserId,
        ...definitionFields(input),
      },
    });
    return toDefinition(cluster);
  }

  static async update(
    ownerUserId: string,
    id: string,
    input: ClusterInput,
    isAdmin: boolean,
  ) {
    const cluster = await prisma.cluster.updateMany({
      where: isAdmin ? { id } : { id, ownerUserId },
      data: definitionFields(input),
    });
    if (cluster.count === 0) return null;

    const updated = await prisma.cluster.findUnique({ where: { id } });
    return toDefinition(updated);
  }

  static async delete(ownerUserId: string, id: string, isAdmin: boolean) {
    const result = await prisma.cluster.deleteMany({
      where: isAdmin ? { id } : { id, ownerUserId },
    });
    return result.count > 0;
  }
}
