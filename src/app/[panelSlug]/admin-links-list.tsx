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
import {
  removeLinkAction,
  reorderLinksAction,
  setMainLinkAction,
  updateLinkLabelAction,
} from "./actions";

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

function EditableLabel({
  label,
  disabled,
  onCommit,
}: {
  label: string;
  disabled?: boolean;
  onCommit: (label: string) => void;
}) {
  const [value, setValue] = useState(label);

  useEffect(() => {
    setValue(label);
  }, [label]);

  function commit() {
    const trimmed = value.trim();
    if (!trimmed) {
      setValue(label);
      return;
    }
    if (trimmed !== label) onCommit(trimmed);
  }

  return (
    <input
      type="text"
      className="admin-link-label"
      value={value}
      disabled={disabled}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}

function SortableRow({
  link,
  onRemove,
  onSetMain,
  onRelabel,
}: {
  link: AdminLinkRecord;
  onRemove: (id: number) => void;
  onSetMain: (id: number) => void;
  onRelabel: (id: number, label: string) => void;
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
      <EditableLabel label={link.label} onCommit={(label) => onRelabel(link.id, label)} />
      <MainToggle isMain={link.isMain} onClick={() => onSetMain(link.id)} />
      <button type="button" onClick={() => onRemove(link.id)}>
        Remove
      </button>
      <span className="admin-link-url">{link.url}</span>
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
      <EditableLabel label={link.label} disabled onCommit={() => {}} />
      <span className={link.isMain ? "admin-link-main admin-link-main--active" : "admin-link-main"}>
        <FiStar />
        {link.isMain ? "Main" : "Set as main"}
      </span>
      <button type="button" disabled>
        Remove
      </button>
      <span className="admin-link-url">{link.url}</span>
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

  function handleRelabel(id: number, label: string) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, label } : l)));
    startTransition(() => {
      updateLinkLabelAction(id, label);
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
              onRelabel={handleRelabel}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
