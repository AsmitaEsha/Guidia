-- Add persisted Voice Guidance preferences.
ALTER TABLE "user_preferences" ADD COLUMN "voiceSpeed" REAL NOT NULL DEFAULT 1.0;
ALTER TABLE "user_preferences" ADD COLUMN "voiceAutoPlay" BOOLEAN NOT NULL DEFAULT false;
