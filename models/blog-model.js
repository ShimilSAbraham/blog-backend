import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    author: {
        type: String,
        trim: true,
        required: [true, 'Author name is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

// Add author index for author-based searches
blogSchema.index({ author: 1 });

const collectionName = 'blog_table';
const BlogModel = mongoose.model('BlogModel', blogSchema, collectionName);

export default BlogModel;
// Note: Ensure that the MongoDB connection is established before performing any operations with this model.