import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/shared/utils/errors";
import { dateInputValueToISO, toDateInputValue } from "@/shared/utils/format";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

/**
 * Formulário de criação genérico, dirigido por config (`FormFieldDef[]`). Cada tela declara
 * seus próprios campos e passa a função `create*` do repo correspondente — o modal em si não
 * sabe nada sobre nenhuma entidade específica.
 */

export interface SelectFieldOption {
  value: string;
  label: string;
}

export type FormFieldType =
  "text" | "number" | "date" | "textarea" | "select" | "checkbox" | "combobox";

export interface FormFieldDef {
  name: string;
  label: string;
  type?: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectFieldOption[];
  defaultValue?: string | number | boolean;
  /** Só pra type "select"/"combobox": ao escolher uma opção, mescla estes valores extra no
   * formulário — ex. um select de colaborador (envia o id) que também preenche um campo de nome
   * denormalizado. Reutilizável por qualquer campo futuro no mesmo formato (categoria,
   * departamento, etc.). */
  deriveFields?: (option: SelectFieldOption) => Record<string, unknown>;
  /** Só pra type "combobox": chamado quando o texto digitado não bate com nenhuma opção
   * existente, pra criar o registro na hora (ex. categoria/departamento novos) — recebe os
   * valores atuais do formulário porque às vezes o registro novo depende de outro campo já
   * escolhido (ex. a categoria herda o "Tipo" do ativo sendo criado). Ausente = combobox só de
   * busca entre as opções existentes, sem oferecer "criar" (ex. colaborador, que tem campos
   * obrigatórios demais pra caber aqui). */
  onCreateOption?: (
    inputValue: string,
    currentValues: Record<string, unknown>,
  ) => Promise<SelectFieldOption>;
}

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormFieldDef[];
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  /** Presente = modo edição: semeia o formulário com o registro existente em vez dos
   * `defaultValue` de cada campo (usados só na criação). Chaves que não batem com nenhum
   * `field.name` são ignoradas. */
  initialValues?: Record<string, unknown>;
  submitLabel?: string;
}

function buildValues(
  fields: FormFieldDef[],
  overrides?: Record<string, unknown>,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    const existing = overrides?.[field.name];
    if (existing === undefined || existing === null) {
      values[field.name] = field.defaultValue ?? (field.type === "checkbox" ? false : "");
    } else if (field.type === "date" && typeof existing === "string") {
      // <input type="date"> só aceita "AAAA-MM-DD". Extrai o dia civil em UTC-3 (não os 10
      // primeiros caracteres do ISO cru) — um registro salvo com hora embutida perto da
      // meia-noite podia cair no dia UTC errado ao simplesmente cortar a string.
      values[field.name] = toDateInputValue(existing);
    } else {
      values[field.name] = existing as string | number | boolean;
    }
  }
  return values;
}

function isEmpty(value: unknown) {
  return value === "" || value === undefined || value === null;
}

/**
 * Select com busca (cmdk) que opcionalmente deixa criar uma opção nova na hora — usado em vez
 * do `<Select>` simples pra qualquer lookup que veio de texto livre antes (categoria,
 * departamento) e agora escolhe de uma tabela de verdade. Sem `onCreateOption`, vira só um
 * select buscável (ex. colaborador — ver `FormFieldDef.onCreateOption`).
 */
export function ComboboxField({
  value,
  options,
  placeholder,
  onSelect,
  onCreateOption,
}: {
  value: string;
  options: SelectFieldOption[];
  placeholder?: string;
  onSelect: (option: SelectFieldOption) => void;
  onCreateOption?: (inputValue: string) => Promise<SelectFieldOption>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const selected = options.find((option) => option.value === value);

  const handleCreate = async () => {
    const name = search.trim();
    if (!onCreateOption || !name || creating) return;
    setCreating(true);
    try {
      onSelect(await onCreateOption(name));
      setOpen(false);
      setSearch("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.label : (placeholder ?? "Selecione…")}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar…" value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>
              {onCreateOption && search.trim() ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary hover:bg-accent disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="size-3.5 shrink-0 animate-spin" />
                  ) : (
                    <Plus className="size-3.5 shrink-0" />
                  )}
                  Criar "{search.trim()}"
                </button>
              ) : (
                <span className="text-muted-foreground">Nada encontrado.</span>
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn("size-4", option.value === value ? "opacity-100" : "opacity-0")}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  onSubmit,
  initialValues,
  submitLabel = "Salvar",
}: ResourceFormDialogProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    buildValues(fields, initialValues),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(buildValues(fields, initialValues));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setValue = (name: string, value: unknown) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const missing = fields.find((field) => field.required && isEmpty(values[field.name]));
    if (missing) {
      setError(`Preencha "${missing.label}".`);
      return;
    }

    // Itera sobre `values` (não só `fields`) pra incluir também os campos que um `deriveFields`
    // injetou sem ter um <Select>/<Input> próprio declarado.
    const numberFields = new Set(fields.filter((f) => f.type === "number").map((f) => f.name));
    // <input type="date"> manda "AAAA-MM-DD" sem fuso — mandar isso cru faz o Postgres (sessão em
    // UTC) gravar meia-noite UTC, um dia atrás de meia-noite em UTC-3. Converte pro instante
    // certo (meia-noite UTC-3) antes de enviar.
    const dateFields = new Set(fields.filter((f) => f.type === "date").map((f) => f.name));
    const payload: Record<string, unknown> = {};
    for (const [name, raw] of Object.entries(values)) {
      if (isEmpty(raw)) continue;
      payload[name] = numberFields.has(name)
        ? Number(raw)
        : dateFields.has(name) && typeof raw === "string"
          ? dateInputValueToISO(raw)
          : raw;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Não foi possível salvar."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                // min-w-0: sem isso, o item do grid herda min-width:auto (= min-content) do
                // filho — um <Select>/<Input> com texto longo empurra a célula (e o input em si)
                // pra fora do modal, mesmo com grid-cols-2 (minmax(0,1fr)) na fileira.
                className={cn("min-w-0 space-y-1.5", field.type === "textarea" && "sm:col-span-2")}
              >
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive"> *</span>}
                </Label>

                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    value={(values[field.name] as string) ?? ""}
                    onChange={(event) => setValue(field.name, event.target.value)}
                    placeholder={field.placeholder}
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={(values[field.name] as string) ?? ""}
                    onValueChange={(value) => {
                      const option = field.options?.find((o) => o.value === value);
                      setValues((prev) => ({
                        ...prev,
                        [field.name]: value,
                        ...(option && field.deriveFields ? field.deriveFields(option) : {}),
                      }));
                    }}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder={field.placeholder ?? "Selecione…"} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "combobox" ? (
                  <ComboboxField
                    value={(values[field.name] as string) ?? ""}
                    options={field.options ?? []}
                    placeholder={field.placeholder}
                    onCreateOption={
                      field.onCreateOption
                        ? (inputValue) => field.onCreateOption!(inputValue, values)
                        : undefined
                    }
                    onSelect={(option) =>
                      setValues((prev) => ({
                        ...prev,
                        [field.name]: option.value,
                        ...(field.deriveFields ? field.deriveFields(option) : {}),
                      }))
                    }
                  />
                ) : field.type === "checkbox" ? (
                  <div className="flex h-9 items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={Boolean(values[field.name])}
                      onCheckedChange={(checked) => setValue(field.name, checked === true)}
                    />
                    <label htmlFor={field.name} className="text-sm text-muted-foreground">
                      {field.placeholder ?? "Sim"}
                    </label>
                  </div>
                ) : (
                  <Input
                    id={field.name}
                    type={
                      field.type === "number" ? "number" : field.type === "date" ? "date" : "text"
                    }
                    step={field.type === "number" ? "any" : undefined}
                    value={(values[field.name] as string | number | undefined) ?? ""}
                    onChange={(event) => setValue(field.name, event.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
