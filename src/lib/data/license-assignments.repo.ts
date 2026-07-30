import { db } from "./client";
import type { Tables } from "./types.gen";

export type LicenseAssignment = Tables<"license_assignments">;

const licenseAssignmentsTable = db.table<LicenseAssignment>("license_assignments");

export const listLicenseAssignments = () => licenseAssignmentsTable.list();
export const createLicenseAssignment = (input: Partial<LicenseAssignment>) =>
  licenseAssignmentsTable.create(input);
export const updateLicenseAssignment = (id: string, patch: Partial<LicenseAssignment>) =>
  licenseAssignmentsTable.update(id, patch);
export const removeLicenseAssignment = (id: string) => licenseAssignmentsTable.remove(id);
