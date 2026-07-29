import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Database, Loader2, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { helpTopics } from "@/shared/content/help";
import { seedDemoData } from "@/shared/utils/seed-demo-data";
import { getErrorMessage } from "@/shared/utils/errors";
import { useAuth } from "@/lib/auth";

export function HelpDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(false);
  const [openTopic, setOpenTopic] = useState("dashboard");
  const topicById = new Map(helpTopics.map((topic) => [topic.id, topic]));

  // TEMPORÁRIO: só existe em build de dev (import.meta.env.DEV é false no `vite build` de
  // produção). Some sozinho quando isso for publicado de verdade — não depende de saber se o
  // gateway é "local" ou não.
  const canSeed = import.meta.env.DEV && (role === "admin" || role === "manager");

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const summary = await seedDemoData();
      await queryClient.invalidateQueries();
      const total = Object.values(summary).reduce((sum, count) => sum + count, 0);
      toast.success(`${total} registros de exemplo criados.`, {
        description: "Confira Dashboard, Ativos, Colaboradores e os demais módulos abaixo.",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível popular os dados de exemplo."));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Guia do AssetHub</SheetTitle>
          <SheetDescription>
            Documentação operacional de cada módulo: o que é, como usar, boas práticas e onde a
            informação cadastrada aqui vai aparecer.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-96px)]">
          {canSeed && (
            <div className="mx-4 mt-4 space-y-2 rounded-lg border border-dashed border-border bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <p className="text-sm font-medium">Workspace vazio?</p>
                <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  DEV
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cria departamentos, ativos, colaboradores, licenças e mais — dados de exemplo
                coerentes entre si, pra você ver onde cada informação aparece antes de cadastrar de
                verdade. Usa os mesmos formulários de sempre, então respeita seu papel/sessão
                normalmente.
              </p>
              <Button size="sm" variant="outline" onClick={handleSeed} disabled={seeding}>
                {seeding ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Database className="size-4" />
                )}
                {seeding ? "Populando…" : "Popular com dados de exemplo"}
              </Button>
            </div>
          )}

          <Accordion
            type="single"
            collapsible
            value={openTopic}
            onValueChange={(value) => value && setOpenTopic(value)}
            className="px-4 py-2"
          >
            {helpTopics.map((topic) => (
              <AccordionItem key={topic.id} value={topic.id}>
                <AccordionTrigger className="text-sm">{topic.title}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{topic.description}</p>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold tracking-wide uppercase">Como utilizar</p>
                    <ul className="space-y-1">
                      {topic.howTo.map((item) => (
                        <li key={item} className="flex gap-2 text-xs text-muted-foreground">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold tracking-wide uppercase">
                      Melhores práticas
                    </p>
                    <ul className="space-y-1">
                      {topic.bestPractices.map((item) => (
                        <li key={item} className="flex gap-2 text-xs text-muted-foreground">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-success" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {topic.relatedTo.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold tracking-wide uppercase">
                        Isso aqui afeta
                      </p>
                      <ul className="space-y-1.5">
                        {topic.relatedTo.map((related) => {
                          const target = topicById.get(related.topicId);
                          if (!target) return null;
                          return (
                            <li key={related.topicId}>
                              <button
                                type="button"
                                onClick={() => setOpenTopic(related.topicId)}
                                className="flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-info" />
                                <span>
                                  <span className="font-medium text-foreground">
                                    {target.title}:
                                  </span>{" "}
                                  {related.note}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
