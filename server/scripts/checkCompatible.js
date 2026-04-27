require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const products = await Product.find({ 'specs.key': 'COMPATIBLE ATTACHMENTS' }, 'title specs');
  products.forEach(p => {
    const spec = p.specs.find(s => s.key === 'COMPATIBLE ATTACHMENTS');
    console.log('=== ' + p.title + ' ===');
    console.log('VALUE:', spec.value);
    console.log('MODAL:', spec.modalContent);
    console.log('');
  });
  await mongoose.disconnect();
});
