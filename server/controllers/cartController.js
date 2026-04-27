const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper: get or create cart
async function getCart(userId, sessionId) {
  const filter = userId ? { userId } : { sessionId };
  return Cart.findOne(filter);
}

async function findOrCreateCart(userId, sessionId) {
  let cart = await getCart(userId, sessionId);
  if (!cart) {
    cart = new Cart(userId ? { userId } : { sessionId });
  }
  return cart;
}

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.json({ success: true, cart: { items: [], total: 0 } });
    }

    const cart = await getCart(userId, sessionId);
    if (!cart) {
      return res.json({ success: true, cart: { items: [], total: 0 } });
    }

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ success: true, cart: { items: cart.items, total } });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart — add item
exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];
    const { productId, quantity = 1 } = req.body;

    if (!userId && !sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required for guest cart', code: 'SESSION_REQUIRED' });
    }

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required', code: 'VALIDATION_ERROR' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found', code: 'NOT_FOUND' });
    }

    const cart = await findOrCreateCart(userId, sessionId);

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += parseInt(quantity);
    } else {
      cart.items.push({
        productId: product._id,
        productName: product.title,
        price: product.price,
        coverImage: product.coverImage,
        quantity: parseInt(quantity),
      });
    }

    await cart.save();

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ success: true, cart: { items: cart.items, total } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/:productId — set quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await getCart(userId, sessionId);
    if (!cart) return res.json({ success: true, cart: { items: [], total: 0 } });

    const idx = cart.items.findIndex(item => item.productId.toString() === productId);
    if (idx >= 0) {
      if (parseInt(quantity) <= 0) {
        cart.items.splice(idx, 1);
      } else {
        cart.items[idx].quantity = parseInt(quantity);
      }
    }

    await cart.save();
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ success: true, cart: { items: cart.items, total } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:productId
exports.removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];
    const { productId } = req.params;

    const cart = await getCart(userId, sessionId);
    if (!cart) {
      return res.json({ success: true, cart: { items: [], total: 0 } });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ success: true, cart: { items: cart.items, total } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const filter = userId ? { userId } : { sessionId };
    await Cart.deleteOne(filter);

    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};
