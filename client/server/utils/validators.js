const Joi = require('joi');

exports.validatePreorder = (data) => {
  const schema = Joi.object({
    customer_name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
    }),
    customer_email: Joi.string().email().required().messages({
      'string.email': 'Invalid email address',
      'string.empty': 'Email is required',
    }),
    customer_phone: Joi.string().min(6).max(20).required().messages({
      'string.empty': 'Phone number is required',
    }),
    customer_address: Joi.string().min(10).max(500).required().messages({
      'string.empty': 'Shipping address is required',
      'string.min': 'Please provide a complete address',
    }),
    product_name: Joi.string().required(),
    product_price: Joi.number().positive().required(),
    quantity: Joi.number().integer().min(1).max(10).default(1),
    total_amount: Joi.number().positive().required(),
  });

  return schema.validate(data, { abortEarly: false });
};

exports.validateSignup = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
  });
  return schema.validate(data, { abortEarly: false });
};

exports.validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data, { abortEarly: false });
};

exports.validateWaitlist = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(data);
};

exports.validateProduct = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().required(),
    price: Joi.number().positive().required(),
    slug: Joi.string().required(),
    coverImage: Joi.string().required(),
    images: Joi.array().items(Joi.string()).default([]),
    category: Joi.string().allow('').optional(),
    inventory: Joi.number().integer().min(0).default(999),
    specs: Joi.array().default([]),
    keyElements: Joi.array().default([]),
    shippingDate: Joi.string().default('March 31st, 2026'),
    isActive: Joi.boolean().default(true),
    isFeatured: Joi.boolean().default(false),
  });
  return schema.validate(data, { abortEarly: false });
};
