const Product = require('../models/Product');
const { validateProduct } = require('../utils/validators');

// GET /api/products/admin/all — admin only: all products including inactive
exports.adminGetAllProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), products });
  } catch (err) {
    next(err);
  }
};

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('slug title description price coverImage category inventory shippingDate')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products — admin only
exports.createProduct = async (req, res, next) => {
  try {
    const { error, value } = validateProduct(req.body);
    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ success: false, message: messages, code: 'VALIDATION_ERROR' });
    }

    const product = await Product.create(value);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id — admin only
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id — admin only (soft delete / deactivate)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id/permanent — admin only (hard delete)
exports.permanentDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, message: 'Product permanently deleted' });
  } catch (err) {
    next(err);
  }
};
