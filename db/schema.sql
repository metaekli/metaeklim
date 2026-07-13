CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY,
  headline TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  background_image_url TEXT,
  profile_image_url TEXT
);

INSERT INTO site_settings (id, headline, message)
VALUES (1, 'EKLIM Agency', '')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  position INTEGER NOT NULL
);
