/**
 * makeAdmin.js — Promote ADMIN_EMAIL to role:'admin', or create the account if missing.
 *
 * Usage:
 *   node server/scripts/makeAdmin.js
 *
 * Reads MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD from .env
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI || !ADMIN_EMAIL) {
  console.error('MONGODB_URI and ADMIN_EMAIL must be set in .env');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const User = require('../models/User');

  let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }).select('+password_hash');

  if (user) {
    if (user.role === 'admin') {
      console.log(`✓ ${ADMIN_EMAIL} is already an admin. Nothing to do.`);
    } else {
      user.role = 'admin';
      // Use direct update to skip the password pre-save hook (password unchanged)
      await User.updateOne({ _id: user._id }, { role: 'admin' });
      console.log(`✓ Promoted ${ADMIN_EMAIL} to admin role.`);
    }
  } else {
    // Create admin user from scratch
    if (!ADMIN_PASSWORD) {
      console.error('User not found. Set ADMIN_PASSWORD in .env to create the account.');
      process.exit(1);
    }
    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      name: 'Admin',
      email: ADMIN_EMAIL.toLowerCase(),
      password_hash,
      role: 'admin',
      isVerified: true,
    });
    console.log(`✓ Created admin account for ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
