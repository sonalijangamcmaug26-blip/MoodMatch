// Safe, non-destructive migration for an existing MoodMatch database.
import pool from '../config/db.js';

try {
  const [columns] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`
  );
  if (columns.length === 0) {
    await pool.query(
      "ALTER TABLE users ADD COLUMN role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER' AFTER email"
    );
    console.log('Added users.role. Existing accounts are USER by default.');
  } else {
    console.log('users.role already exists; no migration needed.');
  }
} catch (error) {
  console.error('Admin migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
