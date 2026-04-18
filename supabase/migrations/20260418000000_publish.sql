-- Migration: publish_verse_reflections
-- Description: Adds qf_published_at to track when a note's verse reflection has been published to Quran Foundation.

ALTER TABLE note_verses ADD COLUMN qf_published_at TIMESTAMP WITH TIME ZONE;
