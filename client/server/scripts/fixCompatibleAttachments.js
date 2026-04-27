/**
 * fixCompatibleAttachments.js — Convert plain-text COMPATIBLE ATTACHMENTS
 * modalContent into clickable product links using the value field as source.
 *
 * Usage: node server/scripts/fixCompatibleAttachments.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const L = `color:#111;text-decoration:underline;font-size:11px;letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:6px;`;

const ATTACHMENT_MAP = [
  { match: /utility flask 1500/i, slug: 'water-bottle-b',  label: 'Utility Flask 1500' },
  { match: /utility flask 560/i,  slug: 'water-bottle-s',  label: 'Utility Flask 560' },
  { match: /utility flask/i,      slug: 'water-bottle-s',  label: 'Utility Flask' },
  { match: /weather mod/i,        slug: 'umbrella',        label: 'Weather Module' },
  { match: /field frame/i,        slug: 'sunglass',        label: 'Field Frame' },
  { match: /field case/i,         slug: 'go-pro',          label: 'Field Case' },
  { match: /field module/i,       slug: 'go-pro',          label: 'Field Module' },
  { match: /sunglasses/i,         slug: 'sunglass',        label: 'Sunglasses Case' },
  { match: /rigid transit 27/i,   slug: 'trolly-bag-pro',  label: 'Rigid Transit 27' },
  { match: /rigid transit 20/i,   slug: 'trolly-bag',      label: 'Rigid Transit 20' },
  { match: /core pack/i,          slug: 'bag-pack',        label: 'Core Pack' },
  { match: /structure sling/i,    slug: 'side-bag',        label: 'Structure Sling' },
];

function buildLinks(valueText) {
  // Values are comma-separated
  const parts = valueText.split(',').map(s => s.trim()).filter(Boolean);
  return parts.map(part => {
    const match = ATTACHMENT_MAP.find(m => m.match.test(part));
    if (match) {
      return `<a href="/products/${match.slug}" style="${L}">${match.label}</a>`;
    }
    // Unknown item — still show it as plain link to products listing
    return `<a href="/products" style="${L}">${part}</a>`;
  }).join('');
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const products = await Product.find({ 'specs.key': 'COMPATIBLE ATTACHMENTS' }, 'title specs');
  console.log(`Found ${products.length} products with COMPATIBLE ATTACHMENTS`);

  for (const product of products) {
    const spec = product.specs.find(s => s.key === 'COMPATIBLE ATTACHMENTS');
    const newContent = buildLinks(spec.value);
    console.log(`\n${product.title}`);
    console.log('  VALUE:', spec.value);
    console.log('  LINKS:', newContent.replace(/<[^>]+>/g, '|'));
    spec.modalContent = newContent;
    product.markModified('specs');
    await product.save();
    console.log('  Saved.');
  }

  console.log('\nDone.');
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
