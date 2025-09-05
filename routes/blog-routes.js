import express from 'express';
import mongoose from 'mongoose';
import BlogModel from '../models/blog-model.js';

const BlogRouter = express.Router();

// GET all blogs - Retrieve and return all blog posts sorted by creation date (oldest first)
BlogRouter.get('/blogs', async (req, res) => {
    try {
        // Fetch all blogs from database and sort by creation date (ascending)
        const allBlogs = await BlogModel.find().sort({ createdAt: 1 });

        // Return successful response with blog data
        res.status(200).json({
            message: 'Blogs retrieved successfully',
            count: allBlogs.length,
            blogs: allBlogs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single blog by ID - Search for a specific blog using MongoDB ObjectId
BlogRouter.get('/blog/id/:id', async (req, res) => {
    try {
        // Extract the ID parameter from the URL
        const { id } = req.params;

        // Validate that the provided ID is a valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid blog ID format' });
        }

        // Search for blog in database using the provided ID
        const blog = await BlogModel.findById(id);

        // Check if blog was found
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        res.status(200).json({
            message: 'Blog found',
            blog: blog
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update blog by ID - Update an existing blog post using its ID
BlogRouter.put('/blog/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body.data;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid blog ID format' });
        }

        if (!updatedData || Object.keys(updatedData).length === 0) {
            return res.status(400).json({ error: 'No update data provided' });
        }

        // Single database operation - much more efficient
        const updateBlog = await BlogModel.findByIdAndUpdate(
            id,
            {
                ...updatedData,        // Spread the update data
                $inc: { __v: 1 }       // Increment version by 1
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updateBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        res.status(200).json({
            message: 'Blog updated successfully',
            blog: updateBlog
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE blog by ID - Remove a blog post from the database using its ID
BlogRouter.delete('/blog/id/:id', async (req, res) => {
    try {
        // Extract the ID parameter from the URL
        const { id } = req.params;

        // Validate that the provided ID is a valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid blog ID format' });
        }

        // Delete blog from database using the provided ID
        const deletedBlog = await BlogModel.findByIdAndDelete(id);

        // Check if blog was found
        if (!deletedBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        res.status(200).json({
            message: 'Blog deleted successfully'
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET blogs by author - Search for blogs by author name (case-insensitive partial match)
BlogRouter.get('/blog/author', async (req, res) => {
    try {
        // Extract author from query parameter: ?name=John%20Doe
        const blogAuthor = req.query.name;

        // Search for blogs using regex for case-insensitive partial matching
        const allBlogs = await BlogModel.find({
            author: { $regex: blogAuthor, $options: 'i' }
        }).sort({ createdAt: 1 });

        if (!allBlogs || allBlogs.length == 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        res.status(200).json({
            message: 'Blogs successfully retrieved by author',
            count: allBlogs.length,
            blogs: allBlogs
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new blog - Create and save a new blog post to the database
BlogRouter.post('/blogs', async (req, res) => {
    try {
        // 1. Extract data (synchronous)
        // Extract blog data from nested request body structure
        const requestBody = req.body.data;

        // 2. Create model instance (synchronous)
        // Create new blog instance using Mongoose model
        // This validates the data against the schema but doesn't save yet
        const blogModel = new BlogModel(requestBody);

        // 3. ⏳ WAIT HERE - Save to database
        // Save the blog to MongoDB database (asynchronous operation)
        // Code execution pauses here until database operation completes
        const savedBlog = await blogModel.save();
        //    ↑ Code pauses here until database operation completes

        // 4. ✅ ONLY AFTER saving completes, send response
        res.status(201).json({
            message: 'Blog created successfully',
            blog: savedBlog
        });

    } catch (err) {
        // 5. If any error occurs during saving, this runs instead
        res.status(400).json({ error: err.message });
    }
});

export default BlogRouter;