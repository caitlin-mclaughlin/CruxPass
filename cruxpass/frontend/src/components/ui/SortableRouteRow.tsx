import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";
import { CSS } from "@dnd-kit/utilities";

export function SortableRouteRow({
  routeId,
  reorderMode,
  disabled,
  children,
}: {
  routeId: string;
  reorderMode: boolean;
  disabled: boolean;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routeId, disabled: !reorderMode || disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-t border-green/20 ${reorderMode ? "route-row-bounce bg-shadow" : ""}`}
    >
      {reorderMode && (
        <td className="border-r border-green/20 px-2 py-2 text-center">
          <button
            type="button"
            className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-muted bg-shadow text-green active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            aria-label="Drag route to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={18} />
          </button>
        </td>
      )}
      {children}
    </tr>
  );
}
