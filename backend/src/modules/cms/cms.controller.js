import { CmsPage } from './cms.model.js';
import { Blog } from './blog.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { getIO } from '../../config/socket.js';

// --- CMS PAGES (Homepage, etc) ---

export const getCmsPage = catchAsync(async (req, res) => {
  const { page } = req.params;
  let cmsPage = await CmsPage.findOne({ page });

  if (!cmsPage) {
    // Return empty skeleton instead of 404 for first load
    cmsPage = new CmsPage({ page, sections: [] });
  }

  return res.status(200).json(new ApiResponse(200, cmsPage, 'CMS page fetched'));
});

export const updateCmsPage = catchAsync(async (req, res) => {
  const { page } = req.params;
  const { sections, seo } = req.body;

  let cmsPage = await CmsPage.findOne({ page });
  
  if (!cmsPage) {
    cmsPage = new CmsPage({ page });
  }

  cmsPage.sections = sections;
  if (seo) cmsPage.seo = seo;
  cmsPage.lastPublishedAt = new Date();

  await cmsPage.save();

  try {
    const io = getIO();
    io.emit('cmsUpdated', { page, sections: cmsPage.sections });
  } catch (err) {}

  return res.status(200).json(new ApiResponse(200, cmsPage, 'CMS page updated successfully'));
});

// --- BLOGS ---

export const getBlogs = catchAsync(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};

  const blogs = await Blog.find(query)
    .populate('author', 'fullName profileImage')
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, blogs, 'Blogs fetched'));
});

export const createBlog = catchAsync(async (req, res) => {
  const blog = new Blog({
    ...req.body,
    author: req.user._id
  });

  if (blog.status === 'Published') {
    blog.publishedAt = new Date();
  }

  await blog.save();

  try {
    if (blog.status === 'Published') {
      const io = getIO();
      io.emit('blogPublished', blog);
    }
  } catch (err) {}

  return res.status(201).json(new ApiResponse(201, blog, 'Blog created'));
});

export const updateBlog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!blog) throw new ApiError(404, 'Blog not found');

  if (req.body.status === 'Published' && !blog.publishedAt) {
    blog.publishedAt = new Date();
    await blog.save();
    try {
      const io = getIO();
      io.emit('blogPublished', blog);
    } catch (err) {}
  }

  return res.status(200).json(new ApiResponse(200, blog, 'Blog updated'));
});
