const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, permanentDeleteProduct, adminGetAllProducts } = require('../controllers/productController');
const { protect, adminOnly } = require('../middlewares/auth');

// Multer setup — save to server/uploads/products/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// Image upload endpoint — returns { url }
router.post('/upload-image', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const url = `/uploads/products/${req.file.filename}`;
  res.json({ success: true, url });
});

router.get('/', getProducts);
// Admin: get all products including inactive (must come before /:slug)
router.get('/admin/all', protect, adminOnly, adminGetAllProducts);
router.get('/:slug', getProductBySlug);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.delete('/:id/permanent', protect, adminOnly, permanentDeleteProduct);

module.exports = router;
