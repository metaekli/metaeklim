"use client";

import { useState } from "react";
import PlatformIcon from "@/components/PlatformIcon";
import { detectPlatform } from "@/lib/platform-detect";
import { addLinkAction } from "./actions";

export default function AddLinkForm() {
  const [url, setUrl] = useState("");
  const preview = url.trim() ? detectPlatform(url) : null;

  return (
    <form
      action={async (formData) => {
        await addLinkAction(formData);
        setUrl("");
      }}
      className="add-link-form"
    >
      <input
        type="url"
        name="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a link (e.g. https://instagram.com/eklim)"
        required
      />
      {preview && (
        <span className="add-link-preview">
          <PlatformIcon platform={preview.platform} /> {preview.label}
        </span>
      )}
      <button type="submit">Add link</button>
    </form>
  );
}
