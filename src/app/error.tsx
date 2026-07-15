"use client";

import { useEffect } from "react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Auto-retry once shortly after mount — most failures here are the
    // database waking up from an idle suspend, which resolves within a
    // few seconds.
    const timer = setTimeout(() => reset(), 3000);
    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <div className="public-page-backdrop">
      <main className="public-card">
        <div className="public-card__blob public-card__blob--a" />
        <div className="public-card__blob public-card__blob--b" />
        <div className="public-card__sheen" />
        <div className="public-card__content">
          <h1 className="headline">One moment</h1>
          <div className="headline-accent" />
          <p className="message">
            This page is just waking up. It should be ready in a few seconds — hang tight.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="link-box link-box--primary"
            style={{ marginTop: 34 }}
          >
            <span className="link-box__label">Try again</span>
          </button>
        </div>
      </main>
    </div>
  );
}
