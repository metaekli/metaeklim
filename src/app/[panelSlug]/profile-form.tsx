"use client";

import { useState } from "react";
import { saveProfile } from "./actions";

export default function ProfileForm({
  initialHeadline,
  initialMessage,
  initialBackgroundUrl,
  initialProfileUrl,
}: {
  initialHeadline: string;
  initialMessage: string;
  initialBackgroundUrl: string | null;
  initialProfileUrl: string | null;
}) {
  const [headline, setHeadline] = useState(initialHeadline);
  const [message, setMessage] = useState(initialMessage);
  const [backgroundPreview, setBackgroundPreview] = useState(initialBackgroundUrl);
  const [profilePreview, setProfilePreview] = useState(initialProfileUrl);

  return (
    <form action={saveProfile} className="profile-form">
      <label>
        Headline
        <input
          type="text"
          name="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
      </label>
      <label>
        Message
        <textarea name="message" value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <label>
        Profile photo
        <input
          type="file"
          name="profileImage"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setProfilePreview(URL.createObjectURL(file));
          }}
        />
      </label>
      {profilePreview && <img src={profilePreview} alt="" className="preview-thumb" />}
      <label>
        Background image
        <input
          type="file"
          name="backgroundImage"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setBackgroundPreview(URL.createObjectURL(file));
          }}
        />
      </label>
      {backgroundPreview && <img src={backgroundPreview} alt="" className="preview-thumb" />}
      <button type="submit">Save</button>
    </form>
  );
}
