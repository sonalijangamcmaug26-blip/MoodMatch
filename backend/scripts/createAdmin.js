// Create or promote an administrator using credentials supplied through
// environment variables. No default admin password is stored in the project.
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';
const fullName = (process.env.ADMIN_NAME || 'MoodMatch Administrator').trim();

if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Set ADMIN_EMAIL to a valid email address before running this script.');
  process.exitCode = 1;
} else if (password.length < 12) {
  console.error('Set ADMIN_PASSWORD to a strong password of at least 12 characters.');
  process.exitCode = 1;
} else {
  try {
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      await pool.query("UPDATE users SET role = 'ADMIN' WHERE user_id = ?", [existing[0].user_id]);
      console.log(`Existing account ${email} now has ADMIN role. Its password was not changed.`);
    } else {
      const passwordHash = await bcrypt.hash(password, 12);
      await pool.query(
        "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'ADMIN')",
        [fullName, email, passwordHash]
      );
      console.log(`Administrator account created for ${email}.`);
    }
  } catch (error) {
    console.error('Could not create administrator:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
