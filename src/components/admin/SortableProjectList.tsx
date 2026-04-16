import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Star, GripVertical } from "lucide-react";
import type { ProjetoDB } from "@/lib/admin-types";

interface SortableProjectListProps {
  projetos: ProjetoDB[];
  statusLabels: Record<string, string>;
  onReorder: (newList: ProjetoDB[]) => void;
  onDelete: (id: string, titulo: string) => void;
}

function SortableItem({ p, statusLabels, onDelete }: { p: ProjetoDB; statusLabels: Record<string, string>; onDelete: (id: string, t: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-primary/20 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
        aria-label="Arrastar"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="w-20 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
        {p.imagem_url ? (
          <img src={p.imagem_url} alt={p.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">{p.titulo}</h3>
          {p.destaque && <Star className="h-4 w-4 text-primary shrink-0 fill-primary" />}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">{p.categoria}</Badge>
          <span className="text-xs text-muted-foreground">{statusLabels[p.status] || p.status}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/projetos/$projetoId" params={{ projetoId: p.id }}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(p.id, p.titulo)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function SortableProjectList({ projetos, statusLabels, onReorder, onDelete }: SortableProjectListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projetos.findIndex((p) => p.id === active.id);
    const newIndex = projetos.findIndex((p) => p.id === over.id);
    onReorder(arrayMove(projetos, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={projetos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {projetos.map((p) => (
            <SortableItem key={p.id} p={p} statusLabels={statusLabels} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
