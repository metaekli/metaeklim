"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PlatformIcon from "@/components/PlatformIcon";
import type { Platform } from "@/lib/platform-detect";
import { removeLinkAction, reorderLinksAction } from "./actions";

export interface AdminLinkRecord {
  id: number;
  url: string;
  platform: Platform;
  label: string;
}

function SortableRow({
  link,
  onRemove,
}: {
  link: AdminLinkRecord;
  onRemove: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: link.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className="admin-link-row" {...attributes} {...listeners}>
      <PlatformIcon platform={link.platform} className="admin-link-icon" />
      <span className="admin-link-label">{link.label}</span>
      <span className="admin-link-url">{link.url}</span>
      <button type="button" onClick={() => onRemove(link.id)}>
        Remove
      </button>
    </li>
  );
}

export default function AdminLinksList({ initialLinks }: { initialLinks: AdminLinkRecord[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const newOrder = arrayMove(links, oldIndex, newIndex);
    setLinks(newOrder);
    startTransition(() => {
      reorderLinksAction(newOrder.map((l) => l.id));
    });
  }

  function handleRemove(id: number) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    startTransition(() => {
      removeLinkAction(id);
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <ul className="admin-link-list">
          {links.map((link) => (
            <SortableRow key={link.id} link={link} onRemove={handleRemove} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
