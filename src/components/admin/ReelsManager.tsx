import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, Link as LinkIcon, GripVertical } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface ReelDraft {
  id?: string;
  tempId: string;
  titulo: string;
  video_url: string;
  thumbnail_url: string;
  tipo: "upload" | "link";
}

interface Props {
  reels: ReelDraft[];
  onChange: (reels: ReelDraft[]) => void;
}

function SortableReel({
  reel,
  onUpdate,
  onRemove,
}: {
  reel: ReelDraft;
  onUpdate: (patch: Partial<ReelDraft>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: reel.tempId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `reels/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("projeto-reels").upload(path, file, { upsert: false });
    if (!error) {
      const { data } = supabase.storage.from("projeto-reels").getPublicUrl(path);
      onUpdate({ video_url: data.publicUrl, tipo: "upload" });
    } else {
      alert(error.message);
    }
    setUploading(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-muted/30 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground p-1" aria-label="Arrastar">
          <GripVertical className="h-4 w-4" />
        </button>
        <Input
          value={reel.titulo}
          onChange={(e) => onUpdate({ titulo: e.target.value })}
          placeholder="Título do reel (ex: Bastidor com o diretor)"
          className="flex-1"
        />
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onUpdate({ tipo: "upload" })}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${reel.tipo === "upload" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          <Upload className="h-3 w-3" /> Upload
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ tipo: "link" })}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${reel.tipo === "link" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          <LinkIcon className="h-3 w-3" /> Link externo
        </button>
      </div>

      {reel.tipo === "upload" ? (
        <div className="space-y-1">
          <Input value={reel.video_url} onChange={(e) => onUpdate({ video_url: e.target.value })} placeholder="URL do vídeo (preenche automaticamente após upload)" />
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-primary hover:underline">
            <Upload className="h-3 w-3" />
            {uploading ? "Enviando..." : "Fazer upload de vídeo"}
            <input type="file" accept="video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      ) : (
        <div className="space-y-1">
          <Label className="text-xs">URL (YouTube Shorts ou Instagram Reel)</Label>
          <Input
            value={reel.video_url}
            onChange={(e) => onUpdate({ video_url: e.target.value })}
            placeholder="https://www.youtube.com/shorts/... ou https://instagram.com/reel/..."
          />
        </div>
      )}

      {reel.video_url && reel.tipo === "upload" && (
        <video src={reel.video_url} className="w-32 aspect-[9/16] rounded object-cover bg-black" />
      )}
    </div>
  );
}

export function ReelsManager({ reels, onChange }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = reels.findIndex((r) => r.tempId === active.id);
    const newI = reels.findIndex((r) => r.tempId === over.id);
    onChange(arrayMove(reels, oldI, newI));
  };

  const addReel = () => {
    onChange([
      ...reels,
      {
        tempId: Math.random().toString(36).slice(2),
        titulo: "",
        video_url: "",
        thumbnail_url: "",
        tipo: "upload",
      },
    ]);
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={reels.map((r) => r.tempId)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {reels.map((reel, i) => (
              <SortableReel
                key={reel.tempId}
                reel={reel}
                onUpdate={(patch) => {
                  const updated = [...reels];
                  updated[i] = { ...updated[i], ...patch };
                  onChange(updated);
                }}
                onRemove={() => onChange(reels.filter((_, idx) => idx !== i))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button variant="outline" size="sm" onClick={addReel} className="gap-1">
        <Plus className="h-4 w-4" /> Adicionar reel
      </Button>
      <p className="text-xs text-muted-foreground">
        Vídeos verticais (formato 9:16) que aparecem na página do projeto. Sem limite de quantidade.
      </p>
    </div>
  );
}
