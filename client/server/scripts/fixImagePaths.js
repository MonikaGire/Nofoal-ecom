/**
 * Fix image paths in MongoDB to match actual files on disk.
 * Run once: node scripts/fixImagePaths.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const fixes = {
  'trolly-bag-pro': {
    images: [
      '/asset/images/products/trolly-bag-big/trolly-bag-1.jpg',
      '/asset/images/products/trolly-bag-big/trolly-bag-2.jpeg',
      '/asset/images/products/trolly-bag-big/trolly-bag-3.jpg',
      '/asset/images/products/trolly-bag-big/trolly-bag-4.jpg',
    ],
    // key-elements folder was named trolly-bag-pro but actual is trolly-bag-big
    keFolder: { from: 'trolly-bag-pro', to: 'trolly-bag-big' },
  },

  'water-bottle-b': {
    images: [
      '/asset/images/products/water-bottle-big/bottle-1.jpeg',
      '/asset/images/products/water-bottle-big/bottle-2.jpeg',
      '/asset/images/products/water-bottle-big/bottle-3.jpg',
    ],
    // key-elements folder was water-bottle-big but actual is bottle-b
    keFolder: { from: 'water-bottle-big', to: 'bottle-b' },
  },

  'water-bottle-s': {
    images: [
      '/asset/images/products/water-bottle-small/bottle-1.jpeg',
      '/asset/images/products/water-bottle-small/bottle-2.jpeg',
      '/asset/images/products/water-bottle-small/bottle-3.jpeg',
    ],
    // key-elements folder was water-bottle-small but actual is bottle-s
    keFolder: { from: 'water-bottle-small', to: 'bottle-s' },
  },

  'sunglass': {
    images: [
      '/asset/images/products/sunglasses/sunglass-1.jpeg',
      '/asset/images/products/sunglasses/sunglass-2.jpeg',
      '/asset/images/products/sunglasses/sunglass-3.jpeg',
    ],
    // key-elements folder was sunglasses but actual is field-frame
    // also k1 extension is .jpeg in field-frame
    keFolder: { from: 'sunglasses', to: 'field-frame' },
    keExtFix: { 'k1.jpg': 'k1.jpeg' }, // card1/card2 use k1.jpeg
  },

  'go-pro': {
    images: [
      '/asset/images/products/go-pro/go-pro-case-1.jpg',
      '/asset/images/products/go-pro/go-pro-case-2.jpg',
      '/asset/images/products/go-pro/go-pro-case-3.jpg',
    ],
    // key-elements folder was go-pro but actual is field-case
    keFolder: { from: 'go-pro', to: 'field-case' },
  },
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const [slug, fix] of Object.entries(fixes)) {
    const product = await Product.findOne({ slug });
    if (!product) { console.log(`  SKIP: ${slug} not found`); continue; }

    const update = {};

    // Fix product images array
    if (fix.images) {
      update.images = fix.images;
    }

    // Fix keyElements image paths (folder rename)
    if (fix.keFolder && product.keyElements?.length) {
      update.keyElements = product.keyElements.map(ke => ({
        ...ke.toObject(),
        images: (ke.images || []).map(imgPath => {
          let p = imgPath.replace(
            `/key-elements/${fix.keFolder.from}/`,
            `/key-elements/${fix.keFolder.to}/`
          );
          // Fix extension if needed
          if (fix.keExtFix) {
            for (const [from, to] of Object.entries(fix.keExtFix)) {
              p = p.replace(new RegExp(from + '$'), to);
            }
          }
          return p;
        }),
      }));
    }

    await Product.updateOne({ slug }, { $set: update });
    console.log(`✓ Fixed: ${slug}`);
    if (fix.images) console.log(`  images: ${fix.images[0]} ...`);
    if (fix.keFolder) console.log(`  key-elements: ${fix.keFolder.from} → ${fix.keFolder.to}`);
  }

  console.log('\nDone.');
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
