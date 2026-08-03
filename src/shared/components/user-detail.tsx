import type { ReactNode } from "react";
import { StatusBadge } from "@/shared/components/status-badge";
import { CargoCell } from "@/shared/components/cargo-cell";
import type { Asset } from "@/lib/data/assets.repo";
import { type Ppe, effectivePpeStatus } from "@/lib/data/ppes.repo";
import { type License, effectiveLicenseStatus } from "@/lib/data/licenses.repo";
import type { LicenseAssignment } from "@/lib/data/license-assignments.repo";
import { formatDate } from "@/shared/utils/format";

export interface UserDetailUser {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "manager" | "rep" | null;
  cargo?: string | null;
}

interface UserDetailData {
  assets: Asset[];
  ppes: Ppe[];
  /** Ausente (não `[]`) = não mostra a seção de assinaturas nem soma ela no "nada atribuído" —
   * é como o manager fica de fora: "quem tem qual assinatura" é admin-only de verdade (mesma
   * regra de `LicensesScreen.tsx`), então o chamador nem busca esses dados pra manager. */
  licenseAssignments?: LicenseAssignment[];
  licenses?: License[];
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="divide-y divide-border rounded-md border border-border">{children}</ul>
    </div>
  );
}

/**
 * Ficha "o que esse usuário tem" — usada em `UsersScreen` (admin). Mesmo padrão `detail` do
 * `ResourcePage` já usado em Ativos/EPIs/Assinaturas — não é uma tela nova.
 *
 * Cargo é editável direto aqui (`CargoCell`, o mesmo componente da coluna Cargo da tabela): se o
 * usuário não tem cargo ainda, dá pra criar um na hora (mesmo combobox criável); se já tem, dá
 * pra trocar ou limpar — sem precisar fechar a gaveta e ir na coluna da tabela.
 */
export function buildUserDetail(user: UserDetailUser, data: UserDetailData) {
  const myAssets = data.assets.filter((asset) => asset.assignee_id === user.id);
  const myPpes = data.ppes.filter((ppe) => ppe.assignee_id === user.id);
  const myLicenses = (data.licenseAssignments ?? [])
    .filter((assignment) => assignment.assignee_id === user.id)
    .map((assignment) => data.licenses?.find((license) => license.id === assignment.license_id))
    .filter((license): license is License => Boolean(license));

  const showLicenses = data.licenseAssignments !== undefined;
  const nothing = myAssets.length === 0 && myPpes.length === 0 && (!showLicenses || myLicenses.length === 0);

  return {
    title: user.name ?? user.email,
    subtitle: user.cargo ?? user.email,
    content: (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Cargo
          </p>
          <CargoCell user={user} />
        </div>
        {nothing && (
          <p className="text-sm text-muted-foreground">Nada atribuído a este usuário ainda.</p>
        )}
        {myAssets.length > 0 && (
          <Section title="Ativos">
            {myAssets.map((asset) => (
              <li key={asset.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{asset.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{asset.tag}</p>
                </div>
                <StatusBadge status={asset.status} />
              </li>
            ))}
          </Section>
        )}
        {myPpes.length > 0 && (
          <Section title="EPIs">
            {myPpes.map((ppe) => (
              <li key={ppe.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{ppe.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ppe.ca ?? "—"} · Validade {formatDate(ppe.expires_at)}
                  </p>
                </div>
                <StatusBadge status={effectivePpeStatus(ppe)} />
              </li>
            ))}
          </Section>
        )}
        {showLicenses && myLicenses.length > 0 && (
          <Section title="Assinaturas">
            {myLicenses.map((license) => (
              <li key={license.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{license.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{license.vendor ?? "—"}</p>
                </div>
                <StatusBadge status={effectiveLicenseStatus(license)} />
              </li>
            ))}
          </Section>
        )}
      </div>
    ),
  };
}
