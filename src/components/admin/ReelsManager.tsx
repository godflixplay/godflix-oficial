import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, Link as LinkIcon, GripVertical, Loader2 } from "lucide-react";
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

const MAX_SIZE_MB = 500;
const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/x-matroska",
  "video/3gpp",
  "video/mpeg",
];

function isExternalVideoUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be|instagram\.com|tiktok\.com|vimeo\.com)/i.test(url);
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
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);

    // Validações
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: ${MAX_SIZE_MB}MB.`);
      return;
    }
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setError(`Formato não suportado (${file.type || "desconhecido"}). Use mp4, mov, webm ou mkv.`);
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `reels/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      setProgress(30);
      const { error: upErr } = await supabase.storage
        .from("projeto-reels")
        .upload(path, file, { upsert: false, contentType: file.type, cacheControl: "3600" });

      if (upErr) {
        throw new Error(upErr.message);
      }

      setProgress(80);
      const { data } = supabase.storage.from("projeto-reels").getPublicUrl(path);
      onUpdate({ video_url: data.publicUrl, tipo: "upload" });
      setProgress(100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha no upload";
      setError(msg);
      console.error("[ReelsManager] upload error:", err);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  // Quando o usuário cola/digita um link externo no campo de URL,
  // mudar automaticamente para o modo "link"
  const handleUrlChange = (value: string) => {
    if (reel.tipo === "upload" && isExternalVideoUrl(value)) {
      onUpdate({ video_url: value, tipo: "link" });
    } else {
      onUpdate({ video_url: value });
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-muted/30 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground p-1"
          aria-label="Arrastar"
        >
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
        <div className="space-y-2">
          <Input
            value={reel.video_url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="URL do vídeo (preenche automaticamente após upload)"
          />
          <label
            className={`inline-flex items-center gap-2 text-xs ${uploading ? "text-muted-foreground cursor-wait" : "text-primary cursor-pointer hover:underline"}`}
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {uploading ? `Enviando... ${progress}%` : "Fazer upload de vídeo"}
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          {uploading && (
            <div className="h-1 w-full bg-muted rounded overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <p className="text-[10px] text-muted-foreground">
            Aceita mp4, mov, webm, mkv até {MAX_SIZE_MB}MB. Para vídeos do Instagram ou YouTube, cole o link no campo
            acima — o sistema detecta automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <Label className="text-xs">URL (YouTube Shorts, Instagram Reel, TikTok ou Vimeo)</Label>
          <Input
            value={reel.video_url}
            onChange={(e) => onUpdate({ video_url: e.target.value })}
            placeholder="https://www.youtube.com/shorts/... ou https://instagram.com/reel/..."
          />
        </div>
      )}

      {reel.video_url && reel.tipo === "upload" && !uploading && (
        <video
          src={reel.video_url}
          className="w-32 aspect-[9/16] rounded object-cover bg-black"
          muted
          playsInline
        />
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
        Vídeos verticais (formato 9:16) que aparecem na página do projeto. Sem limite de quantidade. Aceita upload de
        arquivo OU link do YouTube/Instagram/TikTok.
      </p>
    </div>
  );
}
