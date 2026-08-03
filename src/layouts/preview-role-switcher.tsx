import { Button } from "@/components/ui/button";
import { getPreviewRole, setPreviewRole } from "@/lib/data/preview-fixtures";

// Demo pública (Vercel, mock, sem login) — troca quem "está logado" pra dar pra ver as 3
// telas (admin/manager/rep) sem precisar de conta. Sujo de propósito, é build só-demo.
const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "rep", label: "Rep" },
] as const;

export function PreviewRoleSwitcher() {
  const current = getPreviewRole();

  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-lg">
      {ROLES.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={current === option.value ? "default" : "ghost"}
          className="rounded-full"
          onClick={() => {
            setPreviewRole(option.value);
            window.location.href = "/dashboard";
            window.location.reload();
          }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
