import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { StatusOptionDB } from "@/lib/admin-types";

interface Props {
  status: StatusOptionDB[];
  onChange: () => void;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");

export function StatusManager({ status, onChange }: Props) {
  const [novoLabel, setNovoLabel] = useState("");
  const [busy, setBusy] = useState(false);

  const adicionar = async () => {
    const label = novoLabel.trim();
    if (!label) return;
    const valor = slugify(label);
    if (!valor) return;
    setBusy(true);
    const ordem = (status[status.length - 1]?.ordem ?? 0) + 1;
    const { error } = await supabase.from("status_options" as any).insert({ valor, label, ordem } as any);
    if (!error) {
      setNovoLabel("");
      onChange();
    } else {
      alert(error.message);
    }
    setBusy(false);
  };

  const remover = async (id: string, label: string) => {
    if (!confirm(`Remover status "${label}"?`)) return;
    await supabase.from("status_options" as any).delete().eq("id", id);
    onChange();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={novoLabel}
          onChange={(e) => setNovoLabel(e.target.value)}
          placeholder="Novo status (ex: Pré-produção)"
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
        />
        <Button onClick={adicionar} disabled={busy || !novoLabel.trim()} className="gap-1">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {status.map((s) => (
          <div key={s.id} className="flex items-center gap-1 bg-muted rounded-full pl-3 pr-1 py-1 text-sm text-foreground">
            {s.label}
            <button
              onClick={() => remover(s.id, s.label)}
              className="p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
              aria-label={`Remover ${s.label}`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
