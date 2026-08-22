const crypto = require('crypto');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const Product = require('../models/Products');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// ─── PUBLIC: get all products ───
exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// ─── PROTECTED: add a new product ───
exports.addProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, price, description, status, category, features } = req.body;
  const imageFile = req.file;

  if (!name || !price || !description) {
    throw new AppError('Name, price, and description are required', 400);
  }

  // ── Upload image to Cloudinary if provided ──
  let imageUrl = '';
  if (imageFile) {
    imageUrl = await uploadToCloudinary(imageFile.buffer, 'furniture/products');
  }

  // ── Parse features (comma-separated string → array) ──
  let featuresArray = [];
  if (features) {
    featuresArray = features.split(',').map(f => f.trim()).filter(Boolean);
  }

  const newProduct = new Product({
    id: crypto.randomUUID(),
    userId,
    name,
    price: parseFloat(price),
    description,
    status: status || 'normal',
    category: category || 'tables',
    features: featuresArray,
    image: imageUrl,
  });

  await newProduct.save();
  res.status(201).json(newProduct);
});

// ─── PROTECTED: update a product ───
exports.updateProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;
  const { name, price, description, status, category, features } = req.body;
  const imageFile = req.file;

  const product = await Product.findOne({ id: productId, userId });
  if (!product) {
    throw new AppError('Product not found or unauthorized', 404);
  }

  if (name) product.name = name;
  if (price) product.price = parseFloat(price);
  if (description) product.description = description;
  if (status) product.status = status;
  if (category) product.category = category;

  if (features !== undefined) {
    const featuresArray = features.split(',').map(f => f.trim()).filter(Boolean);
    product.features = featuresArray;
  }

  // ── If a new image is uploaded, upload to Cloudinary ──
  if (imageFile) {
    product.image = await uploadToCloudinary(imageFile.buffer, 'furniture/products');
  }

  await product.save();
  res.json(product);
});

// ─── PROTECTED: delete a product ───
exports.deleteProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;

  const result = await Product.deleteOne({ id: productId, userId });
  if (result.deletedCount === 0) {
    throw new AppError('Product not found or unauthorized', 404);
  }
  res.json({ message: 'Product deleted successfully' });
});