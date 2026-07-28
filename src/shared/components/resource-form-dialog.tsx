import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/shared/utils/errors";

/**
 * Formulário de criação genérico, dirigido por config (`FormFieldDef[]`). Cada tela declara
 * seus próprios campos e passa a função `create*` do repo correspondente — o modal em si não
 * sabe nada sobre nenhuma entidade específica.
 */

export interface SelectFieldOption {
  value: string;
  label: string;
}

export type FormFieldType = "text" | "number" | "date" | "textarea" | "select" | "checkbox";

export interface FormFieldDef {
  name: string;
  label: string;
  type?: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectFieldOption[];
  defaultValue?: string | number | boolean;
}

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormFieldDef[];
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}

function initialValues(fields: FormFieldDef[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    values[field.name] = field.defaultValue ?? (field.type === "checkbox" ? false : "");
  }
  return values;
}

function isEmpty(value: unknown) {
  return value === "" || value === undefined || value === null;
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  onSubmit,
}: ResourceFormDialogProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => initialValues(fields));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(initialValues(fields));
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

    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = values[field.name];
      if (isEmpty(raw)) continue;
      payload[field.name] = field.type === "number" ? Number(raw) : raw;
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
                className={cn("space-y-1.5", field.type === "textarea" && "sm:col-span-2")}
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
                    onValueChange={(value) => setValue(field.name, value)}
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
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
