import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { helpTopics } from "@/shared/content/help";

export function HelpDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Guia do AssetHub</SheetTitle>
          <SheetDescription>
            Documentação operacional de cada módulo: o que é, como usar, boas práticas e atalhos.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-96px)]">
          <Accordion type="single" collapsible defaultValue="dashboard" className="px-4 py-2">
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
                    <p className="text-xs font-semibold tracking-wide uppercase">Melhores práticas</p>
                    <ul className="space-y-1">
                      {topic.bestPractices.map((item) => (
                        <li key={item} className="flex gap-2 text-xs text-muted-foreground">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-success" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold tracking-wide uppercase">Atalhos</p>
                    {topic.shortcuts.map((shortcut) => (
                      <div key={shortcut.keys} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{shortcut.action}</span>
                        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                          {shortcut.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
