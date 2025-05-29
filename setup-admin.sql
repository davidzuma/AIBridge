-- Setup script for MZChat
-- Run this after your first login to set up the initial admin user

-- Set david.zumaquero@energyai.berlin as reviewer
UPDATE "User" 
SET role = 'revisor' 
WHERE email = 'david.zumaquero@energyai.berlin';

-- If the user doesn't exist yet, this will show 0 rows affected
-- You need to login first with Google OAuth, then run this script

-- Verify the change
SELECT id, name, email, role, "createdAt" 
FROM "User" 
WHERE role = 'revisor';

-- Check if the specific user exists and their current role
SELECT id, name, email, role, "createdAt" 
FROM "User" 
WHERE email = 'david.zumaquero@energyai.berlin';

-- Optional: Check all users and their roles
SELECT id, name, email, role, "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC;
