"use client";

import { useActionState, useRef, useState } from "react";
import { saveProfile } from "./actions";
import ImageCropModal from "./image-crop-modal";

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
  const [state, formAction] = useActionState(saveProfile, { error: "" });
  const [headline, setHeadline] = useState(initialHeadline);
  const [message, setMessage] = useState(initialMessage);
  const [backgroundPreview, setBackgroundPreview] = useState(initialBackgroundUrl);
  const [profilePreview, setProfilePreview] = useState(initialProfileUrl);
  const [profileImageBlob, setProfileImageBlob] = useState<Blob | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  function handleProfileFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCropSrc(URL.createObjectURL(file));
    }
  }

  function handleCropConfirm(blob: Blob) {
    setProfileImageBlob(blob);
    setProfilePreview(URL.createObjectURL(blob));
    setCropSrc(null);
    if (profileInputRef.current) profileInputRef.current.value = "";
  }

  function handleCropCancel() {
    setCropSrc(null);
    if (profileInputRef.current) profileInputRef.current.value = "";
  }

  return (
    <>
      <form
        action={(formData) => {
          if (profileImageBlob) {
            formData.set("profileImage", profileImageBlob, "profile.jpg");
          }
          return formAction(formData);
        }}
        className="profile-form"
      >
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
            ref={profileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfileFileChange}
          />
        </label>
        {profilePreview && (
          <img src={profilePreview} alt="" className="preview-thumb preview-thumb--round" />
        )}
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
        {state?.error && <p className="login-error">{state.error}</p>}
      </form>

      {cropSrc && (
        <ImageCropModal imageSrc={cropSrc} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
      )}
    </>
  );
}
