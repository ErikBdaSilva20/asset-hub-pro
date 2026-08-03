import { useMemo } from "react";
import { UserChip } from "@/shared/components/avatar-group";
import type { Asset } from "@/lib/data/assets.repo";
import type { Ppe } from "@/lib/data/ppes.repo";
import type { License } from "@/lib/data/licenses.repo";
import type { LicenseAssignment } from "@/lib/data/license-assignments.repo";
import type { UserLite } from "@/lib/data/users-lite.repo";

export interface UserHoldings {
  user: UserLite;
  assets: Asset[];
  ppes: Ppe[];
  /** [] quando não é admin (assinatura nunca é exposta pro manager, ver CargoScreen.tsx). */
  licenses: License[];
}

/**
 * Agrupa ativos/EPIs/assinaturas por dono numa passada só (Maps, não `.filter()` por usuário) —
 * o card de cada pessoa é O(1) depois disso. Importa porque `assets`/`ppes` vêm inteiros do modo
 * genérico do gateway (sem paginação server-side): um tenant com volume grande não pode virar
 * N² só porque tem muita gente com muita coisa.
 */
export function useUserHoldings(
  users: UserLite[],
  assets: Asset[],
  ppes: Ppe[],
  licenseAssignments: LicenseAssignment[],
  licenses: License[],
): UserHoldings[] {
  return useMemo(() => {
    const assetsByUser = new Map<string, Asset[]>();
    for (const asset of assets) {
      if (!asset.assignee_id) continue;
      const list = assetsByUser.get(asset.assignee_id) ?? [];
      list.push(asset);
      assetsByUser.set(asset.assignee_id, list);
    }

    const ppesByUser = new Map<string, Ppe[]>();
    for (const ppe of ppes) {
      if (!ppe.assignee_id) continue;
      const list = ppesByUser.get(ppe.assignee_id) ?? [];
      list.push(ppe);
      ppesByUser.set(ppe.assignee_id, list);
    }

    const licenseById = new Map(licenses.map((license) => [license.id, license]));
    const licensesByUser = new Map<string, License[]>();
    for (const assignment of licenseAssignments) {
      if (!assignment.assignee_id) continue;
      const license = licenseById.get(assignment.license_id);
      if (!license) continue;
      const list = licensesByUser.get(assignment.assignee_id) ?? [];
      list.push(license);
      licensesByUser.set(assignment.assignee_id, list);
    }

    return users
      .map((user) => ({
        user,
        assets: assetsByUser.get(user.id) ?? [],
        ppes: ppesByUser.get(user.id) ?? [],
        licenses: licensesByUser.get(user.id) ?? [],
      }))
      .filter((entry) => entry.assets.length + entry.ppes.length + entry.licenses.length > 0)
      .sort((a, b) => {
        const totalA = a.assets.length + a.ppes.length + a.licenses.length;
        const totalB = b.assets.length + b.ppes.length + b.licenses.length;
        return totalB - totalA;
      });
  }, [users, assets, ppes, licenseAssignments, licenses]);
}

// Nunca renderiza mais que isto por categoria por card, não importa quantos itens a pessoa
// tenha de verdade — "+N mais" cobre o resto sem estourar o DOM.
const MAX_PILLS_PER_CATEGORY = 4;

function ItemPills({ items }: { items: string[] }) {
  const shown = items.slice(0, MAX_PILLS_PER_CATEGORY);
  const extra = items.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((name, index) => (
        <span
          key={`${name}-${index}`}
          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
        >
          {name}
        </span>
      ))}
      {extra > 0 && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          +{extra} mais
        </span>
      )}
    </div>
  );
}

function HoldingsGroup({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label} ({items.length})
      </p>
      <ItemPills items={items} />
    </div>
  );
}

export function UserHoldingsCard({ holdings }: { holdings: UserHoldings }) {
  const { user, assets, ppes, licenses } = holdings;
  return (
    <div className="panel space-y-3 p-4">
      <UserChip name={user.name ?? user.email} subtitle={user.cargo ?? undefined} />
      <div className="space-y-2.5">
        <HoldingsGroup label="Ativos" items={assets.map((asset) => asset.name)} />
        <HoldingsGroup label="EPIs" items={ppes.map((ppe) => ppe.name)} />
        <HoldingsGroup label="Assinaturas" items={licenses.map((license) => license.name)} />
      </div>
    </div>
  );
}
