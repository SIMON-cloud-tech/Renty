const crypto = require('crypto');
const Blog = require('../models/Blogs');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// ─── PUBLIC: get all blogs ───
exports.getBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
});

// ─── PUBLIC: get a single blog by ID ───
exports.getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findOne({ id });
  if (!blog) {
    throw new AppError('Blog not found', 404);
  }
  res.json(blog);
});

// ─── PUBLIC: increment blog views ───
exports.incrementBlogView = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const blog = await Blog.findOne({ id });
  if (!blog) {
    throw new AppError('Blog not found', 404);
  }
  
  // Increment views
  blog.views = (blog.views || 0) + 1;
  await blog.save();
  
  res.json({ views: blog.views });
});

// ─── PROTECTED: add a new blog ───
exports.addBlog = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, description, keywords } = req.body;
  const imageFile = req.file;

  if (!title || !description) {
    throw new AppError('Title and description are required', 400);
  }

  let imageUrl = '';
  if (imageFile) {
    imageUrl = await uploadToCloudinary(imageFile.buffer, 'furniture/blogs');
  }

  const newBlog = new Blog({
    id: crypto.randomUUID(),
    userId,
    title,
    description,
    keywords: keywords || '',
    image: imageUrl,
  });

  await newBlog.save();
  res.status(201).json(newBlog);
});

// ─── PROTECTED: update a blog ───
exports.updateBlog = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const blogId = req.params.id;
  const { title, description, keywords } = req.body;
  const imageFile = req.file;

  const blog = await Blog.findOne({ id: blogId, userId });
  if (!blog) {
    throw new AppError('Blog not found or unauthorized', 404);
  }

  if (title) blog.title = title;
  if (description) blog.description = description;
  if (keywords !== undefined) blog.keywords = keywords;

  if (imageFile) {
    blog.image = await uploadToCloudinary(imageFile.buffer, 'furniture/blogs');
  }

  await blog.save();
  res.json(blog);
});

// ─── PROTECTED: delete a blog ───
exports.deleteBlog = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const blogId = req.params.id;

  const result = await Blog.deleteOne({ id: blogId, userId });
  if (result.deletedCount === 0) {
    throw new AppError('Blog not found or unauthorized', 404);
  }
  res.json({ message: 'Blog deleted successfully' });
});