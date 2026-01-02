-- Add additional profile fields to users table if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS characters_created INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_chats INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records with character count
UPDATE users u
SET characters_created = (
  SELECT COUNT(*) FROM characters c WHERE c.user_id = u.id
);
