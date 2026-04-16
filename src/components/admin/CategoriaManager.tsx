import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { CategoriaDB } from "@/lib/admin-types";

interface Props {
  categorias: CategoriaDB[];
  onChange: () => void;
}

export function CategoriaManager({ categorias, onChange }: Props) {
  const [nova, setNova] = useState("");
  const [busy, setBusy] = useState(false);

  const adicionar = async () => {
    const nome = nova.trim();
    if (!nome) return;
    setBusy(true);
    const ordem = (categorias[categorias.length - 1]?.ordem ?? 0) + 1;
    const { error } = await supabase.from("categorias" as any).insert({ nome, ordem } as any);
    if (!error) {
      setNova("");
      onChange();
    } else {
      alert(error.message);
    }
    setBusy(false);
  };

  const remover = async (id: string, nome: string) => {
    if (!confirm(`Remover categoria "${nome}"? Projetos com essa categoria não serão afetados.`)) return;
    await supabase.from("categorias" as any).delete().eq("id", id);
    onChange();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          placeholder="Nova categoria (ex: Curta-metragem)"
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
        />
        <Button onClick={adicionar} disabled={busy || !nova.trim()} className="gap-1">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categorias.map((c) => (
          <div key={c.id} className="flex items-center gap-1 bg-muted rounded-full pl-3 pr-1 py-1 text-sm text-foreground">
            {c.nome}
            <button
              onClick={() => remover(c.id, c.nome)}
              className="p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
              aria-label={`Remover ${c.nome}`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
