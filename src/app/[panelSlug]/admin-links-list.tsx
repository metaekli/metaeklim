"use client";

import { useEffect, useState, useTransition } from "react";
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
import { FiMenu, FiStar } from "react-icons/fi";
import PlatformIcon from "@/components/PlatformIcon";
import type { Platform } from "@/lib/platform-detect";
import { removeLinkAction, reorderLinksAction, setMainLinkAction } from "./actions";

export interface AdminLinkRecord {
  id: number;
  url: string;
  platform: Platform;
  label: string;
  isMain: boolean;
}

function MainToggle({ isMain, onClick }: { isMain: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={isMain ? "admin-link-main admin-link-main--active" : "admin-link-main"}
      onClick={onClick}
      aria-pressed={isMain}
      title={isMain ? "This is the main link" : "Set as main link"}
    >
      <FiStar />
      {isMain ? "Main" : "Set as main"}
    </button>
  );
}

function SortableRow({
  link,
  onRemove,
  onSetMain,
}: {
  link: AdminLinkRecord;
  onRemove: (id: number) => void;
  onSetMain: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: link.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className="admin-link-row">
      <button
        type="button"
        className="admin-link-handle"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <FiMenu />
      </button>
      <PlatformIcon platform={link.platform} className="admin-link-icon" />
      <span className="admin-link-label">{link.label}</span>
      <span className="admin-link-url">{link.url}</span>
      <MainToggle isMain={link.isMain} onClick={() => onSetMain(link.id)} />
      <button type="button" onClick={() => onRemove(link.id)}>
        Remove
      </button>
    </li>
  );
}

function StaticRow({ link }: { link: AdminLinkRecord }) {
  return (
    <li className="admin-link-row">
      <span className="admin-link-handle" aria-hidden="true">
        <FiMenu />
      </span>
      <PlatformIcon platform={link.platform} className="admin-link-icon" />
      <span className="admin-link-label">{link.label}</span>
      <span className="admin-link-url">{link.url}</span>
      <span className={link.isMain ? "admin-link-main admin-link-main--active" : "admin-link-main"}>
        <FiStar />
        {link.isMain ? "Main" : "Set as main"}
      </span>
      <button type="button" disabled>
        Remove
      </button>
    </li>
  );
}

export default function AdminLinksList({ initialLinks }: { initialLinks: AdminLinkRecord[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

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

  function handleSetMain(id: number) {
    setLinks((prev) => prev.map((l) => ({ ...l, isMain: l.id === id })));
    startTransition(() => {
      setMainLinkAction(id);
    });
  }

  if (!mounted) {
    return (
      <ul className="admin-link-list">
        {links.map((link) => (
          <StaticRow key={link.id} link={link} />
        ))}
      </ul>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <ul className="admin-link-list">
          {links.map((link) => (
            <SortableRow
              key={link.id}
              link={link}
              onRemove={handleRemove}
              onSetMain={handleSetMain}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
