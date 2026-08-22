const crypto = require('crypto');
const Testimonial = require('../models/Testimonials');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// ─── Helper: ensure testimonial exists and belongs to user ───
const findUserTestimonial = async (id, userId) => {
  const testimonial = await Testimonial.findOne({ id, userId });
  if (!testimonial) throw new AppError('Testimonial not found or unauthorized', 404);
  return testimonial;
};

// ─── PUBLIC: get all testimonials ───
exports.getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.json(testimonials);
});

// ─── PROTECTED: add a new testimonial ───
exports.addTestimonial = asyncHandler(async (req, res) => {
  const { name, location, text } = req.body;
  if (!name || !text) throw new AppError('Name and testimonial text are required', 400);

  const newTestimonial = new Testimonial({
    id: crypto.randomUUID(),
    userId: req.user.id,
    name,
    location: location || '',
    text,
  });

  await newTestimonial.save();
  res.status(201).json(newTestimonial);
});

// ─── PROTECTED: update testimonial ───
exports.updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, location, text } = req.body;

  const testimonial = await findUserTestimonial(id, req.user.id);

  if (name) testimonial.name = name;
  if (location !== undefined) testimonial.location = location;
  if (text) testimonial.text = text;

  await testimonial.save();
  res.json(testimonial);
});

// ─── PROTECTED: delete testimonial ───
exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await Testimonial.deleteOne({ id, userId: req.user.id });

  if (result.deletedCount === 0) {
    throw new AppError('Testimonial not found or unauthorized', 404);
  }
  res.json({ message: 'Testimonial deleted successfully' });
});