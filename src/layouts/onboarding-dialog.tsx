import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { onboardingSteps } from "@/shared/content/help";
import { cn } from "@/lib/utils";

export function OnboardingDialog({ open, onFinish }: { open: boolean; onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const current = onboardingSteps[step];
  const isLast = step === onboardingSteps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onFinish()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            Primeiro acesso · passo {step + 1} de {onboardingSteps.length}
          </p>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {current.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1.5">
          {onboardingSteps.map((item, index) => (
            <span
              key={item.title}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={onFinish}>
            Pular introdução
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            <Button size="sm" onClick={() => (isLast ? onFinish() : setStep(step + 1))}>
              {isLast ? "Começar" : "Próximo"}
              {isLast ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
