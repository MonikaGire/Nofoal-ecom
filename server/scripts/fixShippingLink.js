/**
 * fixShippingLink.js — Replace any 'return-policy.html' href with '/return-policy'
 * in the SHIPPING & RETURNS spec modalContent for all products.
 *
 * Usage:
 *   node server/scripts/fixShippingLink.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const products = await Product.find({ 'specs.key': 'SHIPPING & RETURNS' });
  console.log(`Found ${products.length} products with SHIPPING & RETURNS spec`);

  let updated = 0;
  for (const product of products) {
    let changed = false;
    product.specs = product.specs.map(spec => {
      if (spec.key === 'SHIPPING & RETURNS' && spec.modalContent && spec.modalContent.includes('return-policy.html')) {
        spec.modalContent = spec.modalContent.replace(/return-policy\.html/g, 'return-policy');
        changed = true;
      }
      return spec;
    });
    if (changed) {
      await product.save();
      console.log(`  Fixed: ${product.title}`);
      updated++;
    }
  }

  console.log(`\nDone. Updated ${updated} product(s).`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
