-- Create the 'files' bucket for user-uploaded documents and images
-- Run this in the Supabase SQL editor (https://supabase.com/dashboard/project/_/sql/new)

INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;
