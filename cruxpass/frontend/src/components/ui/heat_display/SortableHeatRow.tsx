import { HeatData } from "@/models/domain";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


export function SortableHeatRow({ heat, children }: { heat: HeatData; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: heat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-green last:border-b-0">
      <td
        className="cursor-grab px-2 text-muted"
        {...attributes}
        {...listeners}
      >
        ≡
      </td>
      {children}
    </tr>
  );
}
