import { useState, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/shared/hooks/use-theme";
import { useLocalStorage } from "@/shared/hooks/use-local-storage";
import { AppHeader } from "./app-header";
import { HelpDrawer } from "./help-drawer";
import { CommandPalette } from "./command-palette";
import { OnboardingDialog } from "./onboarding-dialog";

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const [helpOpen, setHelpOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const onboarding = useLocalStorage<boolean>("assethub.onboarding.done", false);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        <AppHeader
          theme={theme}
          onToggleTheme={toggle}
          onOpenHelp={() => setHelpOpen(true)}
          onOpenSearch={() => setPaletteOpen(true)}
        />
        <main>{children}</main>

        <HelpDrawer open={helpOpen} onOpenChange={setHelpOpen} />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <OnboardingDialog
          open={onboarding.hydrated && !onboarding.value}
          onFinish={() => onboarding.setValue(true)}
        />
        <Toaster position="bottom-right" />
      </div>
    </TooltipProvider>
  );
}
