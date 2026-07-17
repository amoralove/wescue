-- Run this in the Supabase SQL editor to add AI coat color columns to dogs.
-- Safe to run multiple times — uses IF NOT EXISTS.

ALTER TABLE dogs
  ADD COLUMN IF NOT EXISTS coat_primary   TEXT,   -- hex like #8B6914
  ADD COLUMN IF NOT EXISTS coat_secondary TEXT;   -- hex, nullable
