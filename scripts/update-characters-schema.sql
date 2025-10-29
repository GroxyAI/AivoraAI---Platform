-- Update characters table for global character system
ALTER TABLE characters
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS creator_username VARCHAR(255),
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create character_likes table for tracking user likes
CREATE TABLE IF NOT EXISTS character_likes (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(character_id, user_id)
);

-- Create character_favorites table for tracking user favorites
CREATE TABLE IF NOT EXISTS character_favorites (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(character_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_characters_is_global ON characters(is_global);
CREATE INDEX IF NOT EXISTS idx_characters_likes_count ON characters(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_character_likes_user_id ON character_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_character_favorites_user_id ON character_favorites(user_id);

-- Add message attachments support
CREATE TABLE IF NOT EXISTS message_attachments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  file_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  base64_data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
